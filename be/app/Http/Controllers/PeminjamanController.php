<?php

namespace App\Http\Controllers;

use App\Models\Alat;
use App\Models\CartItem;
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

        if (!$aktor || $aktor->role !== 'petugas') {
            return response()->json(['message' => 'Hanya petugas'], 403);
        }

        $search = $request->query('search');
        $status = $request->query('status');

        $query = Peminjaman::with(['user', 'approver'])
            ->select(
                'id',
                'id_user',
                'approved_by',
                'received_by',
                'tanggal_pinjam',
                'tanggal_kembali',
                'rencana_pengembalian',
                'status',
                'catatan'
            );

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('status', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('nama', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $query->orderByRaw("
            CASE
                WHEN status = 'menunggu_konfirmasi' THEN 1
                WHEN status = 'disetujui' THEN 2
                WHEN status = 'menunggu_pengambilan_alat' THEN 3
                WHEN status = 'dipinjam' THEN 4
                WHEN status = 'pengembalian_diajukan' THEN 5
                WHEN status = 'menunggu_pembayaran' THEN 6
                WHEN status = 'terkirim' THEN 7
                WHEN status = 'ditolak' THEN 8
                WHEN status = 'dikembalikan_terlambat' THEN 9
                WHEN status = 'dikembalikan' THEN 10
                ELSE 99
            END
        ");

        $query->orderBy('tanggal_pinjam', 'desc');

        $data = $query->paginate(10)->appends($request->query());

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
     * PETUGAS - LIHAT DETAIL PEMINJAMAN
     * =====================
     */
    public function detailPetugas(string $id, Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'petugas') {
            return response()->json(['message' => 'Hanya petugas'], 403);
        }

        DB::beginTransaction();

        try {
            $peminjaman = Peminjaman::with([
                'user:id,nama,email,phone,alamat',
                'approver:id,nama',
                'receiver:id,nama',
                'detailPeminjaman.alatUnit.alat:id,nama_alat,harga',
            ])
                ->where('id', $id)
                ->first();

            if (!$peminjaman) {
                return response()->json(['message' => 'Data tidak ditemukan'], 404);
            }

            if ($peminjaman->status === 'terkirim') { // ✅ fix
                $peminjaman->update(['status' => 'menunggu_konfirmasi']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Detail peminjaman',
                'data' => [
                    'peminjaman'  => $peminjaman,
                    'peminjam'    => $peminjaman->user,
                    'detail_alat' => $peminjaman->detailPeminjaman
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan',
                'error'   => $e->getMessage()
            ], 500);
        }
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
            'tanggal_pinjam'       => 'required|date',
            'rencana_pengembalian' => 'required|date|after:tanggal_pinjam',
            'catatan'              => 'nullable|string',
            'alat'                 => 'required|array|min:1',
            'alat.*.id_alat_unit'  => 'required|exists:alat_unit,id',
        ]);

        try {
            $peminjaman = DB::transaction(function () use ($data, $aktor) {

                $tanggalPinjam  = Carbon::parse($data['tanggal_pinjam']);
                $rencanaKembali = Carbon::parse($data['rencana_pengembalian']);
                $lamaPinjam     = $tanggalPinjam->diffInDays($rencanaKembali);

                // 🔒 Validasi unit & batas peminjaman
                foreach ($data['alat'] as $item) {
                    $unit = \App\Models\AlatUnit::where('id', $item['id_alat_unit'])
                        ->lockForUpdate()
                        ->with('alat')
                        ->first();

                    if (!$unit) {
                        throw new \Exception('Unit alat tidak ditemukan');
                    }

                    if ($unit->status !== 'Tersedia') {
                        throw new \Exception(
                            "Unit {$unit->kode_unit} tidak tersedia untuk dipinjam"
                        );
                    }

                    if ($lamaPinjam > $unit->alat->batas_peminjaman) {
                        throw new \Exception(
                            "Alat {$unit->alat->nama_alat} hanya bisa dipinjam maksimal {$unit->alat->batas_peminjaman} hari"
                        );
                    }
                }

                // 📝 Buat peminjaman
                $peminjaman = Peminjaman::create([
                    'id_user'              => $aktor->id,
                    'tanggal_pinjam'       => $data['tanggal_pinjam'],
                    'rencana_pengembalian' => $data['rencana_pengembalian'],
                    'catatan'              => $data['catatan'] ?? null,
                    'status'               => 'terkirim',
                ]);

                // 📦 Detail peminjaman
                foreach ($data['alat'] as $item) {
                    DetailPeminjaman::create([
                        'id_peminjaman' => $peminjaman->id,
                        'id_alat_unit'  => $item['id_alat_unit'],
                    ]);
                }

                // 🔥 Hapus cart item yang di-checkout
                CartItem::whereHas('cart', function ($q) use ($aktor) {
                    $q->where('user_id', $aktor->id)
                        ->where('status', 'active');
                })
                    ->where('is_selected', true)
                    ->update([
                        'status'      => 'checked_out',
                        'is_selected' => false,
                    ]);

                return $peminjaman;
            });

            return response()->json([
                'message' => 'Peminjaman berhasil diajukan',
                'data'    => $peminjaman
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

        $perPage = $request->get('per_page', 5);
        $status  = $request->get('status');
        $sortBy  = $request->get('sort_by');
        $sortDir = $request->get('sort_dir', 'asc');

        $query = Peminjaman::with('detailPeminjaman.alatUnit.alat')
            ->where('id_user', $aktor->id);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($sortBy) {
            if ($sortBy === 'jumlah_alat') {
                $query->withCount('detailPeminjaman')
                    ->orderBy('detail_peminjaman_count', $sortDir);
            } else {
                $query->orderBy($sortBy, $sortDir);
            }
        } else {
            // default: prioritas status + terbaru
            $query->orderByRaw("
        CASE
            WHEN status = 'menunggu_konfirmasi' THEN 1
            WHEN status = 'disetujui' THEN 2
            WHEN status = 'menunggu_pengambilan_alat' THEN 3
            WHEN status = 'dipinjam' THEN 4
            WHEN status = 'pengembalian_diajukan' THEN 5
            WHEN status = 'menunggu_pembayaran' THEN 6
            WHEN status = 'terkirim' THEN 7
            WHEN status = 'ditolak' THEN 8
            WHEN status = 'dikembalikan_terlambat' THEN 9
            WHEN status = 'dikembalikan' THEN 10
            ELSE 99
        END
    ");

            $query->latest();
        }

        $data = $query->paginate($perPage);

        return response()->json([
            'message' => 'Peminjaman saya',
            'data' => $data->items(),
            'meta' => [
                'current_page' => $data->currentPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
                'last_page' => $data->lastPage(),
            ]
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

        $peminjaman = Peminjaman::find($id);

        if (!$peminjaman || $peminjaman->status !== 'menunggu_konfirmasi') {
            return response()->json(['message' => 'Status tidak valid'], 400);
        }

        $peminjaman->update([
            'approved_by' => $aktor->id,
            'status'      => 'menunggu_pengambilan_alat',
        ]);

        Log::create([
            'user_id'   => $aktor->id,
            'aktor'     => $aktor->nama,
            'aktivitas' => "Menyetujui peminjaman ID {$peminjaman->id}",
            'ip'        => $request->ip(),
        ]);

        return response()->json(['message' => 'Peminjaman disetujui']);
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

        if (!$peminjaman || $peminjaman->status !== 'menunggu_konfirmasi') {
            return response()->json(['message' => 'Status tidak valid'], 400);
        }

        $data = $request->validate([
            'catatan' => 'required|string'
        ]);

        $peminjaman->update([
            'approved_by' => $aktor->id,
            'status' => 'ditolak',
            'alasan_penolakan' => $data['catatan'],
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
                'status' => 'pengembalian_diajukan',
            ]);

            Log::create([
                'user_id'   => $aktor->id,
                'aktor'     => $aktor->nama,
                'aktivitas' => "Mengajukan pengembalian peminjaman ID {$peminjaman->id}",
                'ip'        => $request->ip(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Pengembalian berhasil diajukan, menunggu konfirmasi petugas'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Terjadi kesalahan',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function konfirmasiPengambilan(string $id, Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'petugas') {
            return response()->json(['message' => 'Hanya petugas'], 403);
        }

        $data = $request->validate([
            'units'                   => 'required|array',
            'units.*.detail_id'       => 'required|exists:detail_peminjaman,id',
            'units.*.kondisi_sebelum' => 'required|string',
            'units.*.foto_sebelum'    => 'required|image|max:2048',
        ]);

        DB::beginTransaction();

        try {
            $peminjaman = Peminjaman::with('detailPeminjaman.alatUnit')->find($id);

            if (!$peminjaman || $peminjaman->status !== 'menunggu_pengambilan_alat') {
                return response()->json(['message' => 'Status tidak valid'], 400);
            }

            foreach ($data['units'] as $index => $unit) {
                $detail = $peminjaman->detailPeminjaman->firstWhere('id', $unit['detail_id']);
                if (!$detail) continue;

                $fotoPath = $request->file("units.{$index}.foto_sebelum")?->store('peminjaman/sebelum', 'public');
                $fotoUrl  = $fotoPath ? asset('storage/' . $fotoPath) : null;

                $detail->alatUnit->update(['status' => 'Dipinjam']);
                $detail->update([
                    'kondisi_sebelum' => $unit['kondisi_sebelum'],
                    'foto_sebelum'    => $fotoUrl,
                ]);
            }

            $peminjaman->update([
                'status' => 'dipinjam',
            ]);

            Log::create([
                'user_id'   => $aktor->id,
                'aktor'     => $aktor->nama,
                'aktivitas' => "Mengkonfirmasi pengambilan alat peminjaman ID {$peminjaman->id}",
                'ip'        => $request->ip(),
            ]);

            DB::commit();

            return response()->json(['message' => 'Pengambilan alat dikonfirmasi, status dipinjam']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function konfirmasiPengembalian(string $id, Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'petugas') {
            return response()->json(['message' => 'Hanya petugas'], 403);
        }

        $data = $request->validate([
            'tanggal_kembali'             => 'required|date',
            'units'                       => 'required|array',
            'units.*.detail_id'           => 'required|exists:detail_peminjaman,id',
            'units.*.kondisi_sesudah'     => 'required|in:baik,rusak_ringan,rusak_berat,hilang',
            'units.*.foto_sesudah'        => 'required|image|max:2048',
        ]);

        DB::beginTransaction();

        try {
            $peminjaman = Peminjaman::with('detailPeminjaman.alatUnit.alat')
                ->where('id', $id)
                ->where('status', 'pengembalian_diajukan')
                ->firstOrFail();

            $tanggalKembali = Carbon::parse($data['tanggal_kembali']);
            $rencanaKembali = Carbon::parse($peminjaman->rencana_pengembalian);
            $terlambatHari = max(0, $tanggalKembali->startOfDay()->diffInDays($rencanaKembali->startOfDay(), false) * -1);
            $isTerlambat    = $terlambatHari > 0;

            foreach ($data['units'] as $index => $unit) {
                $detail = $peminjaman->detailPeminjaman->firstWhere('id', $unit['detail_id']);
                if (!$detail) continue;

                $dendaKerusakanPersen = match ($unit['kondisi_sesudah']) {
                    'rusak_ringan' => 25,
                    'rusak_berat'  => 60,
                    'hilang'       => 100,
                    default        => 0,
                };

                $fotoPath = $request->file("units.{$index}.foto_sesudah")?->store('peminjaman/sesudah', 'public');
                $fotoUrl  = $fotoPath ? asset('storage/' . $fotoPath) : null;

                $harga              = $detail->alatUnit->alat->harga ?? 0;
                $dendaKerusakan     = $harga * $dendaKerusakanPersen / 100;
                $dendaKeterlambatan = $harga * 0.01 * $terlambatHari;
                $totalDenda         = $dendaKerusakan + $dendaKeterlambatan;

                $detail->update([
                    'total_denda'     => $totalDenda,
                    'kondisi_sesudah' => $unit['kondisi_sesudah'],
                    'foto_sesudah'    => $fotoUrl,
                ]);

                $statusUnit = $unit['kondisi_sesudah'] === 'hilang' ? 'Tidak Tersedia' : 'Tersedia';
                $detail->alatUnit->update(['status' => $statusUnit]);
            }

            // Hitung total denda setelah semua unit diupdate
            $peminjaman->refresh();
            $totalDendaKeseluruhan = $peminjaman->detailPeminjaman->sum('total_denda');
            $adaDenda = $totalDendaKeseluruhan > 0;

            if ($adaDenda) {
                // Ada denda → tunggu pembayaran dulu
                $peminjaman->update([
                    'status'          => 'menunggu_pembayaran',
                    'tanggal_kembali' => $data['tanggal_kembali'],
                    'received_by'     => $aktor->id,
                    'is_terlambat'    => $isTerlambat, // simpan info terlambat untuk nanti
                ]);
            } else {
                // Tidak ada denda → langsung selesai
                $peminjaman->update([
                    'status'          => $isTerlambat ? 'dikembalikan_terlambat' : 'dikembalikan',
                    'tanggal_kembali' => $data['tanggal_kembali'],
                    'received_by'     => $aktor->id,
                ]);
            }

            Log::create([
                'user_id'   => $aktor->id,
                'aktor'     => $aktor->nama,
                'aktivitas' => "Mengkonfirmasi pengembalian peminjaman ID {$peminjaman->id}"
                    . ($isTerlambat ? " (terlambat {$terlambatHari} hari)" : ""),
                'ip'        => $request->ip(),
            ]);

            DB::commit();

            return response()->json([
                'message'        => $adaDenda ? 'Pengembalian dikonfirmasi, menunggu pembayaran denda' : 'Pengembalian berhasil dikonfirmasi',
                'terlambat_hari' => $terlambatHari,
                'ada_denda'      => $adaDenda,
                'total_denda'    => $totalDendaKeseluruhan,
                'status'         => $adaDenda ? 'menunggu_pembayaran' : ($isTerlambat ? 'dikembalikan_terlambat' : 'dikembalikan'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
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

    /**
     * =====================
     * PEMINJAM - DETAIL PEMINJAMAN
     * =====================
     */
    public function detailPeminjam(string $id, Request $request)
    {
        $aktor = $request->user();

        if ($aktor->role !== 'peminjam') {
            return response()->json(['message' => 'Hanya peminjam'], 403);
        }

        $peminjaman = Peminjaman::with([
            'detailPeminjaman.alatUnit.alat:id,nama_alat,foto_alat,harga,deskripsi,id_kategori',
            'detailPeminjaman.alatUnit.alat.kategori',
            'approver:id,nama',  // tambahkan ini
            'receiver:id,nama',  // tambahkan ini
        ])
            ->where('id', $id)
            ->where('id_user', $aktor->id)
            ->first();

        if (!$peminjaman) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        // Transform foto_alat
        $peminjaman->detailPeminjaman->each(function ($detail) {
            if ($detail->alatUnit && $detail->alatUnit->alat && $detail->alatUnit->alat->foto_alat) {
                $foto = $detail->alatUnit->alat->foto_alat;
                if (!str_starts_with($foto, 'http')) {
                    $detail->alatUnit->alat->foto_alat = asset('storage/' . $foto);
                }
            }
        });

        return response()->json([
            'message' => 'Detail peminjaman',
            'data' => $peminjaman
        ]);
    }

    public function laporanPdf(Request $request)
    {
        $query = Peminjaman::with(['user', 'detailPeminjaman.alatUnit.alat'])
            ->when($request->tanggal_mulai, fn($q) =>
            $q->whereDate('tanggal_pinjam', '>=', $request->tanggal_mulai))
            ->when($request->tanggal_akhir, fn($q) =>
            $q->whereDate('tanggal_pinjam', '<=', $request->tanggal_akhir))
            ->when($request->status && $request->status !== 'all', fn($q) =>
            $q->where('status', $request->status))
            ->orderBy('tanggal_pinjam', 'desc')
            ->get();

        return response()->json(['data' => $query]);
    }
}
