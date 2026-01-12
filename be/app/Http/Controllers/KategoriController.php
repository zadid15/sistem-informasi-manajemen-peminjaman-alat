<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KategoriController extends Controller
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

        $query = Kategori::select('id', 'nama_kategori', 'deskripsi', 'foto_kategori');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_kategori', 'like', "%{$search}%");
            });
        }

        $kategori = $query->paginate(10);

        $kategori->getCollection()->transform(function ($kategori) {
            return [
                'id' => $kategori->id,
                'nama_kategori' => $kategori->nama_kategori,
                'deskripsi' => $kategori->deskripsi,
                'foto_kategori' => $kategori->foto_kategori,
            ];
        });

        return response()->json([
            'message' => 'List of kategori',
            'data' => $kategori->items(),
            'pagination' => [
                'current_page' => $kategori->currentPage(),
                'last_page' => $kategori->lastPage(),
                'per_page' => $kategori->perPage(),
                'total' => $kategori->total(),
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
            'nama_kategori' => 'required|string|unique:kategori,nama_kategori',
            'deskripsi' => 'nullable|string',
            'foto_kategori' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        $kategori = Kategori::create($data);

        Log::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Menambah kategori: {$kategori->nama_kategori} (ID: {$kategori->id})",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Kategori berhasil ditambahkan',
            'data' => $kategori
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id, Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'admin') {
            return response()->json([
                'message' => 'Hanya admin yang bisa mengakses.'
            ], 403);
        }

        $kategori = Kategori::find($id);

        if (!$kategori) {
            return response()->json([
                'message' => 'Kategori tidak ditemukan'
            ], 404);
        } else {
            return response()->json([
                'message' => 'Detail kategori',
                'data' => $kategori
            ]);
        }
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

        $kategori = Kategori::find($id);

        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan'
            ], 404);
        }

        $data = $request->validate([
            'nama_kategori' => 'sometimes|required|string|unique:kategori,nama_kategori,' . $id,
            'deskripsi' => 'sometimes|required|string',
            'foto_kategori' => 'sometimes|required|string',
        ]);

        $kategori->update($data);

        Log::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Memperbarui kategori: {$kategori->nama_kategori} (ID: {$kategori->id})",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Kategori berhasil diperbarui',
            'data' => $kategori
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

        $kategori = Kategori::find($id);

        if (!$kategori) {
            return response()->json([
                'message' => 'Kategori tidak ditemukan'
            ], 404);
        }

        $kategori->delete();

        Log::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Menghapus kategori: {$kategori->nama_kategori} (ID: {$kategori->id})",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Kategori berhasil dihapus'
        ]);
    }
}
