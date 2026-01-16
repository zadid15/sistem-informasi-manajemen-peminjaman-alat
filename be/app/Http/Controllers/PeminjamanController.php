<?php

namespace App\Http\Controllers;

use App\Models\Alat;
use App\Models\DetailPeminjaman;
use App\Models\Log;
use App\Models\Peminjaman;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PeminjamanController extends Controller
{
    /**
     * =====================
     * ADMIN - LIST ALL
     * =====================
     */
    public function index(Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin'], 403);
        }

        $search = $request->query('search');

        $query = Peminjaman::with(['user', 'approver'])
            ->select(
                'id',
                'id_user',
                'approved_by',
                'received_by',
                'tanggal_pinjam',
                'tanggal_kembali',
                'kondisi_sebelum',
                'kondisi_sesudah',
                'status',
                'catatan'
            );

        if ($search) {
            $query->where('status', 'like', "%{$search}%");
        }

        $data = $query->paginate(10);

        return response()->json([
            'message' => 'List peminjaman',
            'data' => $data->items(),
            'pagination' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ]
        ]);
    }

    /**
     * =====================
     * PEMINJAM - AJUKAN
     * =====================
     */
    public function ajukan(Request $request)
    {
        $aktor = $request->user();

        if ($aktor->role !== 'peminjam') {
            return response()->json([
                'message' => 'Hanya peminjam yang dapat mengajukan peminjaman'
            ], 403);
        }

        $data = $request->validate([
            'tanggal_pinjam' => 'required|date',
            'rencana_pengembalian' => 'required|date|after:tanggal_pinjam',
            'catatan' => 'nullable|string',
            'alat' => 'required|array|min:1',
            'alat.*.id_alat' => 'required|exists:alat,id',
            'alat.*.jumlah' => 'required|integer|min:1'
        ]);

        try {
            $peminjaman = DB::transaction(function () use ($data, $aktor) {

                $tanggalPinjam   = Carbon::parse($data['tanggal_pinjam']);
                $rencanaKembali  = Carbon::parse($data['rencana_pengembalian']);
                $lamaPinjam      = $tanggalPinjam->diffInDays($rencanaKembali);

                // 🔒 Validasi stok & batas pinjam (LOCKED)
                foreach ($data['alat'] as $item) {

                    $alat = Alat::where('id', $item['id_alat'])
                        ->lockForUpdate()
                        ->first();

                    if (!$alat) {
                        throw new \Exception('Alat tidak ditemukan');
                    }

                    if ($alat->jumlah_tersedia < $item['jumlah']) {
                        throw new \Exception(
                            "Stok alat {$alat->nama_alat} tidak mencukupi"
                        );
                    }

                    if ($lamaPinjam > $alat->batas_peminjaman) {
                        throw new \Exception(
                            "Alat {$alat->nama_alat} hanya bisa dipinjam maksimal {$alat->batas_peminjaman} hari"
                        );
                    }
                }

                // 📝 Buat peminjaman
                $peminjaman = Peminjaman::create([
                    'id_user' => $aktor->id,
                    'tanggal_pinjam' => $data['tanggal_pinjam'],
                    'rencana_pengembalian' => $data['rencana_pengembalian'],
                    'catatan' => $data['catatan'] ?? null,
                    'status' => 'diajukan',
                ]);

                // 📦 Detail peminjaman
                foreach ($data['alat'] as $item) {
                    DetailPeminjaman::create([
                        'id_peminjaman' => $peminjaman->id,
                        'id_alat' => $item['id_alat'],
                        'jumlah' => $item['jumlah'],
                    ]);
                }

                return $peminjaman;
            });

            return response()->json([
                'message' => 'Peminjaman berhasil diajukan',
                'data' => $peminjaman
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function saya(Request $request)
    {
        $aktor = $request->user();

        if ($aktor->role !== 'peminjam') {
            return response()->json(['message' => 'Hanya peminjam'], 403);
        }

        $data = Peminjaman::with('detailPeminjaman.alat')
            ->where('id_user', $aktor->id)
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Peminjaman saya',
            'data' => $data
        ]);
    }

    /**
     * =====================
     * PETUGAS - SETUJUI
     * =====================
     */
    public function setujui(string $id, Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'petugas') {
            return response()->json(['message' => 'Hanya petugas'], 403);
        }

        $data = $request->validate([
            'kondisi_sebelum' => 'required|string',
            'foto_sebelum' => 'required|image|max:2048'
        ]);

        DB::beginTransaction();

        try {
            $peminjaman = Peminjaman::with('detailPeminjaman.alat')->find($id);

            if (!$peminjaman || $peminjaman->status !== 'diajukan') {
                return response()->json(['message' => 'Status tidak valid'], 400);
            }

            // 🔁 Loop setiap alat yang dipinjam
            foreach ($peminjaman->detailPeminjaman as $detail) {
                $alat = $detail->alat;

                // ❌ Cek stok
                if ($alat->jumlah_tersedia < $detail->jumlah) {
                    return response()->json([
                        'message' => "Stok alat {$alat->nama_alat} tidak mencukupi"
                    ], 400);
                }

                // ✅ Update stok alat
                $alat->update([
                    'jumlah_tersedia' => $alat->jumlah_tersedia - $detail->jumlah,
                    'jumlah_dipinjam' => $alat->jumlah_dipinjam + $detail->jumlah,
                ]);
            }

            // ✅ Update peminjaman
            $peminjaman->update([
                'approved_by' => $aktor->id,
                'kondisi_sebelum' => $data['kondisi_sebelum'],
                'status' => 'dipinjam',
            ]);

            // 📝 Log aktivitas
            Log::create([
                'user_id' => $aktor->id,
                'aktor' => $aktor->nama,
                'aktivitas' => "Menyetujui peminjaman ID {$peminjaman->id}",
                'ip' => $request->ip(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Peminjaman disetujui'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Terjadi kesalahan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * =====================
     * PETUGAS - TOLAK
     * =====================
     */
    public function tolak(string $id, Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'petugas') {
            return response()->json(['message' => 'Hanya petugas'], 403);
        }

        $peminjaman = Peminjaman::find($id);

        if (!$peminjaman || $peminjaman->status !== 'diajukan') {
            return response()->json(['message' => 'Status tidak valid'], 400);
        }

        $data = $request->validate([
            'catatan' => 'required|string'
        ]);

        $peminjaman->update([
            'approved_by' => $aktor->id,
            'status' => 'ditolak',
            'catatan' => $data['catatan']
        ]);

        Log::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Menolak peminjaman ID {$peminjaman->id}",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Peminjaman ditolak'
        ]);
    }

    /**
     * =====================
     * PEMINJAM - KEMBALI
     * =====================
     */
    public function ajukanPengembalian(string $id, Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'peminjam') {
            return response()->json(['message' => 'Hanya peminjam'], 403);
        }

        DB::beginTransaction();

        try {
            $peminjaman = Peminjaman::where('id', $id)
                ->where('id_user', $aktor->id)
                ->where('status', 'dipinjam')
                ->first();

            if (!$peminjaman) {
                return response()->json([
                    'message' => 'Peminjaman tidak valid atau tidak bisa diajukan pengembalian'
                ], 400);
            }

            $peminjaman->update([
                'status' => 'menunggu_konfirmasi_pengembalian',
                'tanggal_pengajuan_kembali' => now(),
            ]);

            Log::create([
                'user_id' => $aktor->id,
                'aktor' => $aktor->nama,
                'aktivitas' => "Mengajukan pengembalian peminjaman ID {$peminjaman->id}",
                'ip' => $request->ip(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Pengembalian berhasil diajukan, menunggu konfirmasi petugas'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Terjadi kesalahan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function konfirmasiPengembalian(string $id, Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'petugas') {
            return response()->json(['message' => 'Hanya petugas'], 403);
        }

        $data = $request->validate([
            'kondisi_sesudah' => 'required|in:baik,rusak',
            'foto_sesudah' => 'required|image|max:2048'
        ]);

        DB::beginTransaction();

        try {
            $peminjaman = Peminjaman::with('detailPeminjaman.alat')
                ->where('id', $id)
                ->where('status', 'menunggu_konfirmasi_pengembalian')
                ->first();

            if (!$peminjaman) {
                return response()->json(['message' => 'Data tidak valid'], 400);
            }

            $tanggalKembali = Carbon::today();
            $rencanaPengembalian = Carbon::parse($peminjaman->rencana_pengembalian);

            $hariTerlambat = 0;
            if ($tanggalKembali->gt($rencanaPengembalian)) {
                $hariTerlambat = $tanggalKembali->diffInDays($rencanaPengembalian);
            }

            foreach ($peminjaman->detailPeminjaman as $detail) {
                $alat = $detail->alat;

                // ===== HITUNG DENDA =====
                $dendaPerHari = $alat->harga * 0.001; // 0.1%
                $totalDenda = $hariTerlambat * $dendaPerHari * $detail->jumlah;

                $detail->update([
                    'total_denda' => $totalDenda
                ]);

                // ===== UPDATE STOK =====
                if ($data['kondisi_akhir'] === 'baik') {
                    $alat->increment('jumlah_tersedia', $detail->jumlah);
                }

                $alat->decrement('jumlah_dipinjam', $detail->jumlah);
            }

            $peminjaman->update([
                'status' => $data['kondisi_akhir'] === 'baik'
                    ? 'dikembalikan'
                    : 'dikembalikan_rusak',
                'kondisi_akhir' => $data['kondisi_akhir'],
                'received_by' => $aktor->id,
                'tanggal_kembali' => $tanggalKembali,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Pengembalian dikonfirmasi',
                'hari_terlambat' => $hariTerlambat
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * =====================
     * ADMIN - DELETE
     * =====================
     */
    public function destroy(string $id, Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin'], 403);
        }

        $peminjaman = Peminjaman::find($id);

        if (!$peminjaman) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $peminjaman->delete();

        Log::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Menghapus peminjaman ID {$id}",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Peminjaman dihapus'
        ]);
    }
}
