<?php

namespace App\Http\Controllers;

use App\Models\Alat;
use App\Models\AlatUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AlatUnitController extends Controller
{
    /**
     * List unit berdasarkan alat
     */
    public function index(Request $request, $alatId)
    {
        $alat = Alat::findOrFail($alatId);

        $search = $request->search;
        $status = $request->status;

        $query = AlatUnit::where('alat_id', $alatId);

        // search kode unit
        if ($search) {
            $query->where('kode_unit', 'like', "%{$search}%");
        }

        // filter status
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $units = $query->orderBy('kode_unit')
            ->paginate(10)
            ->appends($request->query());

        return response()->json([
            'data' => $units->items(),
            'pagination' => [
                'current_page' => $units->currentPage(),
                'last_page' => $units->lastPage(),
                'per_page' => $units->perPage(),
                'total' => $units->total(),
            ],
            'message' => "Berhasil mengambil unit untuk alat {$alat->nama_alat}"
        ]);
    }

    /**
     * Tambah unit ke alat
     */
    public function store(Request $request, $alatId)
    {
        $alat = Alat::findOrFail($alatId);

        $data = $request->validate([
            'jumlah_unit' => 'required|integer|min:1|max:100',
            'kondisi' => 'required|string|max:50',
            'lokasi' => 'required|string|max:100',
        ]);

        DB::beginTransaction();
        try {

            $lastNumber = AlatUnit::where('alat_id', $alat->id)
                ->lockForUpdate()
                ->max('nomor_urut') ?? 0;

            for ($i = 1; $i <= $data['jumlah_unit']; $i++) {

                $num = $lastNumber + $i;

                $kodeUnit = strtoupper(substr($alat->nama_alat, 0, 3))
                    . '-' . str_pad($num, 3, '0', STR_PAD_LEFT);

                $created[] = AlatUnit::create([
                    'alat_id' => $alat->id,
                    'nomor_urut' => $num,
                    'kode_unit' => $kodeUnit,
                    'kondisi' => $data['kondisi'],
                    'status' => 'Tersedia',
                    'lokasi' => $data['lokasi'],
                ]);
            }

            DB::commit();

            return response()->json([
                'data' => $created,
                'message' => count($created) . ' unit berhasil ditambahkan'
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Gagal menambah unit',
                'error' => $e->getMessage(), // 🔥 penting
            ], 500);
        }
    }

    /**
     * Update kondisi / status unit
     */
    public function update(Request $request, AlatUnit $unit)
    {
        $data = $request->validate([
            'kondisi' => 'sometimes|string|max:50',
            'lokasi'  => 'sometimes|string|max:100',
            'status'  => 'sometimes|string',
        ]);

        if ($unit->status === 'Dipinjam' && isset($data['status']) && $data['status'] !== 'Dipinjam') {
            return response()->json([
                'message' => 'Unit sedang dipinjam, tidak bisa mengubah status secara langsung.'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $unit->update($data);
            DB::commit();

            return response()->json([
                'data'    => $unit->fresh(),
                'message' => 'Unit berhasil diperbarui',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui unit',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Hapus unit
     */
    public function destroy($unitId)
    {
        $unit = AlatUnit::findOrFail($unitId);

        // cegah hapus kalau sedang dipinjam
        if ($unit->status === 'Dipinjam') {
            return response()->json([
                'message' => 'Unit sedang dipinjam, tidak bisa dihapus'
            ], 422);
        }

        $unit->delete();

        return response()->json([
            'message' => 'Unit berhasil dihapus'
        ]);
    }
}
