<?php

namespace App\Http\Controllers;

use App\Models\Peminjaman;
use App\Models\Alat;
use App\Models\AlatUnit;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $aktor = $request->user();
        if (!$aktor || $aktor->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin'], 403);
        }

        // === STATISTIK UTAMA ===
        $totalAlat        = Alat::count();
        $totalUnit        = AlatUnit::count();
        $unitTersedia     = AlatUnit::where('status', 'Tersedia')->count();
        $unitDipinjam     = AlatUnit::where('status', 'Dipinjam')->count();
        $unitTidakTersedia = AlatUnit::where('status', 'Tidak Tersedia')->count();
        $totalPeminjam    = User::where('role', 'peminjam')->count();

        // === STATISTIK PEMINJAMAN ===
        $totalPeminjaman        = Peminjaman::count();
        $peminjamanMenunggu     = Peminjaman::where('status', 'menunggu_konfirmasi')->count();
        $peminjamanDipinjam     = Peminjaman::where('status', 'dipinjam')->count();
        $peminjamanDikembalikan = Peminjaman::whereIn('status', ['dikembalikan', 'dikembalikan_terlambat'])->count();
        $peminjamanDitolak      = Peminjaman::where('status', 'ditolak')->count();
        $pengembalianDiajukan   = Peminjaman::where('status', 'pengembalian_diajukan')->count();

        // === TERLAMBAT ===
        $terlambat = Peminjaman::where('status', 'dipinjam')
            ->where('rencana_pengembalian', '<', Carbon::today())
            ->count();

        // === DENDA TOTAL ===
        $totalDenda = \App\Models\DetailPeminjaman::sum('total_denda');

        // === PEMINJAMAN PER BULAN (12 bulan terakhir) ===
        $peminjamanPerBulan = [];
        for ($i = 11; $i >= 0; $i--) {
            $bulan = Carbon::now()->subMonths($i);
            $peminjamanPerBulan[] = [
                'bulan' => $bulan->translatedFormat('M Y'),
                'total' => Peminjaman::whereYear('created_at', $bulan->year)
                    ->whereMonth('created_at', $bulan->month)
                    ->count(),
                'dikembalikan' => Peminjaman::whereYear('created_at', $bulan->year)
                    ->whereMonth('created_at', $bulan->month)
                    ->whereIn('status', ['dikembalikan', 'dikembalikan_terlambat'])
                    ->count(),
            ];
        }

        // === KONDISI UNIT ===
        $kondisiUnit = AlatUnit::selectRaw('kondisi, count(*) as total')
            ->groupBy('kondisi')
            ->get();

        // === ALAT TERPOPULER ===
        $alatTerpopuler = Alat::withCount(['detailPeminjaman as total_dipinjam'])
            ->orderByDesc('total_dipinjam')
            ->limit(5)
            ->get(['id', 'nama_alat', 'foto_alat'])
            ->map(fn($alat) => [
                'id'             => $alat->id,
                'nama_alat'      => $alat->nama_alat,
                'foto_alat'      => $alat->foto_alat ? asset('storage/' . $alat->foto_alat) : null,
                'total_dipinjam' => $alat->total_dipinjam,
            ]);

        // === PEMINJAMAN TERBARU ===
        $peminjamanTerbaru = Peminjaman::with(['user:id,nama,email', 'detailPeminjaman.alatUnit.alat:id,nama_alat'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // === PERLU TINDAKAN ===
        $perluTindakan = Peminjaman::whereIn('status', ['menunggu_konfirmasi', 'pengembalian_diajukan'])
            ->with(['user:id,nama', 'detailPeminjaman.alatUnit.alat:id,nama_alat'])
            ->orderBy('created_at')
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'statistik' => [
                    'total_alat'          => $totalAlat,
                    'total_unit'          => $totalUnit,
                    'unit_tersedia'       => $unitTersedia,
                    'unit_dipinjam'       => $unitDipinjam,
                    'unit_tidak_tersedia' => $unitTidakTersedia,
                    'total_peminjam'      => $totalPeminjam,
                    'total_peminjaman'    => $totalPeminjaman,
                    'menunggu_konfirmasi' => $peminjamanMenunggu,
                    'sedang_dipinjam'     => $peminjamanDipinjam,
                    'dikembalikan'        => $peminjamanDikembalikan,
                    'ditolak'             => $peminjamanDitolak,
                    'pengembalian_diajukan' => $pengembalianDiajukan,
                    'terlambat'           => $terlambat,
                    'total_denda'         => (float) $totalDenda,
                ],
                'peminjaman_per_bulan' => $peminjamanPerBulan,
                'kondisi_unit'         => $kondisiUnit,
                'alat_terpopuler'      => $alatTerpopuler,
                'peminjaman_terbaru'   => $peminjamanTerbaru,
                'perlu_tindakan'       => $perluTindakan,
            ]
        ]);
    }

    public function petugas(Request $request)
    {
        $aktor = $request->user();
        if (!$aktor || $aktor->role !== 'petugas') {
            return response()->json(['message' => 'Hanya petugas'], 403);
        }

        // === STATISTIK ===
        $terkirim             = Peminjaman::where('status', 'terkirim')->count();
        $menungguKonfirmasi   = Peminjaman::where('status', 'menunggu_konfirmasi')->count();
        $pengembalianDiajukan = Peminjaman::where('status', 'pengembalian_diajukan')->count();
        $sedangDipinjam       = Peminjaman::where('status', 'dipinjam')->count();
        $terlambat            = Peminjaman::where('status', 'dipinjam')
            ->where('rencana_pengembalian', '<', Carbon::today())
            ->count();
        $unitTersedia         = AlatUnit::where('status', 'Tersedia')->count();
        $unitDipinjam         = AlatUnit::where('status', 'Dipinjam')->count();

        // === PERLU DIKONFIRMASI (menunggu + pengembalian diajukan) ===
        $perluKonfirmasi = Peminjaman::whereIn('status', ['terkirim', 'menunggu_konfirmasi', 'pengembalian_diajukan'])
            ->with(['user:id,nama,phone', 'detailPeminjaman.alatUnit.alat:id,nama_alat'])
            ->orderBy('created_at')
            ->limit(10)
            ->get();

        // === SEDANG DIPINJAM (termasuk yang terlambat) ===
        $dipinjamSekarang = Peminjaman::where('status', 'dipinjam')
            ->with(['user:id,nama,phone', 'detailPeminjaman.alatUnit.alat:id,nama_alat'])
            ->orderBy('rencana_pengembalian')
            ->limit(10)
            ->get()
            ->map(fn($p) => [
                'id'                  => $p->id,
                'status'              => $p->status,
                'tanggal_pinjam'      => $p->tanggal_pinjam,
                'rencana_pengembalian' => $p->rencana_pengembalian,
                'terlambat'           => Carbon::today()->gt(Carbon::parse($p->rencana_pengembalian)),
                'hari_terlambat'      => max(0, Carbon::today()->diffInDays(Carbon::parse($p->rencana_pengembalian), false) * -1),
                'user'                => $p->user,
                'detail_peminjaman'   => $p->detailPeminjaman,
            ]);

        // === KONDISI UNIT ===
        $kondisiUnit = AlatUnit::selectRaw('kondisi, count(*) as total')
            ->groupBy('kondisi')
            ->get();

        // === AKTIVITAS TERBARU (yang sudah dikonfirmasi petugas ini) ===
        $aktivitasSaya = Peminjaman::where(function ($q) use ($aktor) {
            $q->where('approved_by', $aktor->id)
                ->orWhere('received_by', $aktor->id);
        })
            ->whereIn('status', ['dipinjam', 'dikembalikan', 'dikembalikan_terlambat', 'ditolak'])
            ->with(['user:id,nama', 'detailPeminjaman.alatUnit.alat:id,nama_alat'])
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'statistik' => [
                    'terkirim'              => $terkirim,
                    'menunggu_konfirmasi'   => $menungguKonfirmasi,
                    'pengembalian_diajukan' => $pengembalianDiajukan,
                    'sedang_dipinjam'       => $sedangDipinjam,
                    'terlambat'             => $terlambat,
                    'unit_tersedia'         => $unitTersedia,
                    'unit_dipinjam'         => $unitDipinjam,
                ],
                'perlu_konfirmasi'   => $perluKonfirmasi,
                'dipinjam_sekarang'  => $dipinjamSekarang,
                'kondisi_unit'       => $kondisiUnit,
                'aktivitas_saya'     => $aktivitasSaya,
            ]
        ]);
    }
}
