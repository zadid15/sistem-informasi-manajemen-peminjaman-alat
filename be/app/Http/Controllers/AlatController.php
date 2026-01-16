<?php

namespace App\Http\Controllers;

use App\Models\Alat;
use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AlatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'admin') {
            return response()->json([
                'message' => 'Hanya admin yang bisa mengakses.'
            ], 403);
        }

        // Ambil query parameter search
        $search = $request->query('search');

        $query = Alat::with('kategori')->select(
            'id',
            'nama_alat',
            'kode_alat',
            'deskripsi',
            'foto_alat',
            'jumlah_tersedia',
            'jumlah_dipinjam',
            'kondisi',
            'id_kategori'
        );

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_alat', 'like', "%{$search}%")
                    ->orWhere('kode_alat', 'like', "%{$search}%");
            });
        }

        $alat = $query->paginate(10);

        $alat->getCollection()->transform(function ($alat) {
            return [
                'id' => $alat->id,
                'nama_alat' => $alat->nama_alat,
                'kode_alat' => $alat->kode_alat,
                'deskripsi' => $alat->deskripsi,
                'foto_alat' => $alat->foto_alat,
                'jumlah_tersedia' => $alat->jumlah_tersedia,
                'jumlah_dipinjam' => $alat->jumlah_dipinjam,
                'kondisi' => $alat->kondisi,
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
            return response()->json([
                'message' => 'Hanya admin yang bisa mengakses.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nama_alat' => 'required|string|max:255',
            'kode_alat' => 'required|string|unique:alat,kode_alat',
            'deskripsi' => 'required|string',
            'foto_alat' => 'required|image|max:2048',
            'jumlah_tersedia' => 'required|integer|min:0',
            'jumlah_dipinjam' => 'required|integer|min:0',
            'kondisi' => 'required|string',
            'id_kategori' => 'required|exists:kategori,id',
            'harga' => 'required|integer|min:0',
            'lokasi' => 'required|string',
            'batas_peminjaman' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        $alat = Alat::create($data);

        Log::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Menambah alat: {$alat->nama_alat} (ID: {$alat->id})",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Alat berhasil ditambahkan',
            'data' => [
                'id' => $alat->id,
                'nama_alat' => $alat->nama_alat,
                'kode_alat' => $alat->kode_alat,
                'deskripsi' => $alat->deskripsi,
                'foto_alat' => $alat->foto_alat,
                'jumlah_tersedia' => $alat->jumlah_tersedia,
                'jumlah_dipinjam' => $alat->jumlah_dipinjam,
                'kondisi' => $alat->kondisi,
                'id_kategori' => $alat->id_kategori,
                'harga' => $alat->harga,
                'lokasi' => $alat->lokasi,
                'batas_peminjaman' => $alat->batas_peminjaman,
            ]
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Alat $alat)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
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
                'success' => false,
                'message' => 'Alat tidak ditemukan'
            ], 404);
        }

        $data = $request->validate([
            'nama_alat' => 'sometimes|required|string|max:255',
            'kode_alat' => 'sometimes|required|string|unique:alat,kode_alat,' . $id,
            'deskripsi' => 'sometimes|required|string',
            'foto_alat' => 'sometimes|required|string',
            'jumlah_tersedia' => 'sometimes|required|integer|min:0',
            'jumlah_dipinjam' => 'sometimes|required|integer|min:0',
            'kondisi' => 'sometimes|required|string',
            'id_kategori' => 'sometimes|required|exists:kategori,id',
            'harga' => 'sometimes|required|integer|min:0',
            'lokasi' => 'sometimes|required|string',
            'batas_peminjaman' => 'sometimes|required|integer|min:0',
        ]);

        $alat->update($data);

        Log::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Mengubah alat: {$alat->nama_alat} (ID: {$alat->id})",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Alat berhasil diperbarui',
            'data' => $alat
        ]);
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
