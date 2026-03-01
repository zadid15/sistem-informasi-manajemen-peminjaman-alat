<?php

namespace App\Http\Controllers;

use App\Models\Alat;
use App\Models\AlatUnit;
use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AlatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getListAlatForUserWithoudLogin(Request $request)
    {
        // ambil query param
        $search   = $request->query('search');
        $kategori = $request->query('kategori'); // sebelumnya "category"
        $status   = $request->query('status');

        // base query
        $query = Alat::with('kategori')
            ->select(
                'id',
                'nama_alat',
                'id_kategori',
                'deskripsi',
                'foto_alat',
                'harga',
                'batas_peminjaman',
                'spesifikasi',
                'jumlah_unit'
            );

        // filter search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_alat', 'like', "%{$search}%");
            });
        }

        // filter kategori
        if (!empty($kategori) && $kategori !== 'all') {
            $query->where('id_kategori', $kategori);
        }

        // ambil semua data tanpa paginate
        $alat = $query->get();

        // transform response
        $data = $alat->map(function ($alat) {
            return [
                'id'          => $alat->id,
                'nama_alat'   => $alat->nama_alat,
                'id_kategori' => [
                    'id'   => $alat->id_kategori,
                    'nama_kategori' => $alat->kategori?->nama_kategori
                ],
                'kategori'    => $alat->kategori?->nama_kategori,
                'deskripsi'   => $alat->deskripsi,
                'status'      => $alat->status,
                'foto_alat'   => $alat->foto_alat
                    ? asset('storage/' . $alat->foto_alat)
                    : null,

                'spesifikasi' => $alat->spesifikasi ?? [],
                'jumlah_unit' => $alat->jumlah_unit,
            ];
        });

        // response
        return response()->json([
            'message' => 'List of alat',
            'data'    => $data,
        ]);
    }

    public function index(Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'admin') {
            return response()->json([
                'message' => 'Hanya admin yang bisa mengakses.'
            ], 403);
        }

        $search   = $request->query('search');
        $category = $request->query('category');
        $status   = $request->query('status');

        $query = Alat::with('kategori')->select(
            'id',
            'nama_alat',
            'id_kategori',
            'deskripsi',
            'foto_alat',
            'harga',
            'batas_peminjaman',
            'spesifikasi',
            'jumlah_unit'
        );

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_alat', 'like', "%{$search}%");
            });
        }

        if ($category && $category !== 'all') {
            $query->whereHas('kategori', function ($q) use ($category) {
                $q->where('nama_kategori', $category);
            });
        }

        $alat = $query->paginate(10);

        $alat->getCollection()->transform(function ($alat) {
            return [
                'id' => $alat->id,
                'nama_alat' => $alat->nama_alat,
                'harga' => $alat->harga,
                'batas_peminjaman' => $alat->batas_peminjaman,
                'kategori' => [
                    'id' => $alat->id_kategori,
                    'nama_kategori' => $alat->kategori?->nama_kategori
                ],
                'deskripsi' => $alat->deskripsi,
                'foto_alat' => $alat->foto_alat
                    ? asset('storage/' . $alat->foto_alat)
                    : null,

                'spesifikasi' => $alat->spesifikasi ?? [],
                'jumlah_unit' => $alat->jumlah_unit,
            ];
        });

        return response()->json([
            'message' => 'List of alat',
            'data' => $alat->items(),
            'pagination' => [
                'current_page' => $alat->currentPage(),
                'last_page' => $alat->lastPage(),
                'per_page' => $alat->perPage(),
                'total' => $alat->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang bisa mengakses.'], 403);
        }

        $data = $request->validate([
            'nama_alat' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'foto_alat' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'id_kategori' => 'required|exists:kategori,id',
            'harga' => 'required|integer|min:0',
            'batas_peminjaman' => 'required|integer|min:0',
            'spesifikasi' => 'nullable|array',

            'jumlah_unit' => 'required|integer|min:1',
            'lokasi_awal' => 'required|string',
        ]);

        DB::beginTransaction();
        try {

            // upload foto
            if ($request->hasFile('foto_alat')) {
                $file = $request->file('foto_alat');
                $filename = uniqid('alat_') . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('alat', $filename, 'public');
                $data['foto_alat'] = $path;
            }

            // 1️⃣ buat katalog alat
            $alat = Alat::create([
                'nama_alat' => $data['nama_alat'],
                'deskripsi' => $data['deskripsi'],
                'foto_alat' => $data['foto_alat'] ?? null,
                'id_kategori' => $data['id_kategori'],
                'harga' => $data['harga'],
                'batas_peminjaman' => $data['batas_peminjaman'],
                'spesifikasi' => $data['spesifikasi'] ?? null,
                'jumlah_unit' => $data['jumlah_unit'],
            ]);

            // 2️⃣ generate unit
            for ($i = 1; $i <= $data['jumlah_unit']; $i++) {

                $kodeUnit = strtoupper(substr($alat->nama_alat, 0, 3))
                    . '-' . str_pad($i, 3, '0', STR_PAD_LEFT);

                AlatUnit::create([
                    'alat_id' => $alat->id,
                    'kode_unit' => $kodeUnit,
                    'nomor_urut' => $i,
                    'kondisi' => 'Baik',
                    'status' => 'Tersedia',
                    'lokasi' => $data['lokasi_awal'],
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Alat & unit berhasil dibuat',
                'alat_id' => $alat->id
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal membuat alat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */

    public function showWithoutLogin($id)
    {
        // Pakai find() manual, jangan route model binding
        $alat = Alat::with('kategori')->find($id);

        if (!$alat) {
            return response()->json([
                'message' => 'Alat tidak ditemukan',
                'data' => null
            ], 404);
        }

        return response()->json([
            'message' => 'Detail alat',
            'data' => [
                'id'            => $alat->id,
                'nama_alat'     => $alat->nama_alat,
                'harga'         => $alat->harga,
                'batas_peminjaman' => $alat->batas_peminjaman,
                'kategori'      => [
                    'id'            => $alat->id_kategori,
                    'nama_kategori' => $alat->kategori?->nama_kategori
                ],
                'deskripsi'     => $alat->deskripsi,
                'foto_alat'     => $alat->foto_alat ? asset('storage/' . $alat->foto_alat) : null,
                'spesifikasi'   => $alat->spesifikasi ?? [],
                'jumlah_unit'   => $alat->jumlah_unit,
            ]
        ]);
    }

    public function show(Alat $alat)
    {
        // Load relasi kategori
        $alat->load('kategori');

        // Transform agar formatnya sama persis dengan index
        $data = [
            'id'            => $alat->id,
            'nama_alat'     => $alat->nama_alat,
            'kategori'      => [
                'id'            => $alat->id_kategori,
                'nama_kategori' => $alat->kategori?->nama_kategori
            ],
            'deskripsi'     => $alat->deskripsi,
            'foto_alat'     => $alat->foto_alat
                ? asset('storage/' . $alat->foto_alat)
                : null,

            // Ambil data JSON spesifikasi dari database, sama seperti index
            'spesifikasi'   => $alat->spesifikasi ?? [],
            'jumlah_unit'   => $alat->jumlah_unit,
        ];

        return response()->json([
            'message' => 'Detail alat',
            'data'    => $data,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang bisa mengakses.'], 403);
        }

        $alat = Alat::findOrFail($id);
        $currentUnitCount = $alat->alatUnit()->count();
        $newUnitCount = (int) $request->input('jumlah_unit');
        $needsUnitInfo = $newUnitCount > $currentUnitCount;

        if ($request->has('spesifikasi') && is_string($request->spesifikasi)) {
            $request->merge([
                'spesifikasi' => json_decode($request->spesifikasi, true)
            ]);
        }

        $data = $request->validate([
            'nama_alat'        => 'required|string|max:255',
            'deskripsi'        => 'nullable|string',
            'foto_alat'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'id_kategori'      => 'required|exists:kategori,id',
            'harga'            => 'required|integer|min:0',
            'batas_peminjaman' => 'required|integer|min:0',
            'spesifikasi'      => 'nullable|array',
            'jumlah_unit'      => 'required|integer|min:1',
            'kondisi_awal'     => ($needsUnitInfo ? 'required' : 'nullable') . '|string',
            'lokasi_awal'      => ($needsUnitInfo ? 'required' : 'nullable') . '|string',
        ]);

        DB::beginTransaction();
        try {
            if ($request->hasFile('foto_alat')) {
                if ($alat->foto_alat && Storage::disk('public')->exists($alat->foto_alat)) {
                    Storage::disk('public')->delete($alat->foto_alat);
                }

                $file = $request->file('foto_alat');
                $filename = uniqid('alat_') . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('alat', $filename, 'public');
                $data['foto_alat'] = $path;
            }

            $alat->update([
                'nama_alat'        => $data['nama_alat'],
                'deskripsi'        => $data['deskripsi'] ?? $alat->deskripsi,
                'foto_alat'        => $data['foto_alat'] ?? $alat->foto_alat,
                'id_kategori'      => $data['id_kategori'],
                'harga'            => $data['harga'],
                'batas_peminjaman' => $data['batas_peminjaman'],
                'spesifikasi'      => $data['spesifikasi'] ?? $alat->spesifikasi,
                'jumlah_unit'      => $data['jumlah_unit'],
            ]);

            if ($newUnitCount > $currentUnitCount) {
                for ($i = $currentUnitCount + 1; $i <= $newUnitCount; $i++) {
                    $kodeUnit = strtoupper(substr($alat->nama_alat, 0, 3)) . '-' . str_pad($i, 3, '0', STR_PAD_LEFT);

                    AlatUnit::create([
                        'alat_id'  => $alat->id,
                        'kode_unit' => $kodeUnit,
                        'kondisi'  => $data['kondisi_awal'],
                        'status'   => 'Tersedia',
                        'lokasi'   => $data['lokasi_awal'],
                    ]);
                }
            } elseif ($newUnitCount < $currentUnitCount) {
                $unitsToDelete = $alat->alatUnit()
                    ->where('status', 'Tersedia')
                    ->latest()
                    ->take($currentUnitCount - $newUnitCount)
                    ->get();

                foreach ($unitsToDelete as $unit) {
                    $unit->delete();
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Alat & unit berhasil diupdate',
                'alat_id' => $alat->id
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal update alat',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'admin') {
            return response()->json([
                'message' => 'Hanya admin yang bisa mengakses.'
            ], 403);
        }

        $alat = Alat::find($id);

        if (!$alat) {
            return response()->json([
                'message' => 'Alat tidak ditemukan'
            ], 404);
        }

        $alat->delete();

        Log::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Menghapus alat: {$alat->nama_alat} (ID: {$alat->id})",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Alat berhasil dihapus'
        ]);
    }
}
