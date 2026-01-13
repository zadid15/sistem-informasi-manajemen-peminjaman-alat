<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Peminjaman;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PeminjamanController extends Controller
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

        $query = Peminjaman::with(['user', 'receiver'])->select(
            'id',
            'id_user',
            'received_by',
            'tanggal_pinjam',
            'tanggal_kembali',
            'kondisi',
            'status',
            'catatan',
        );

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('status', 'like', "%{$search}%");
            });
        }

        $peminjaman = $query->paginate(10);

        $peminjaman->getCollection()->transform(function ($peminjaman) {
            return [
                'id' => $peminjaman->id,
                'user' => $peminjaman->user,
                'receiver' => $peminjaman->receiver,
                'tanggal_pinjam' => $peminjaman->tanggal_pinjam,
                'tanggal_kembali' => $peminjaman->tanggal_kembali,
                'kondisi' => $peminjaman->kondisi,
                'status' => $peminjaman->status,
                'catatan' => $peminjaman->catatan,
            ];
        });

        return response()->json([
            'message' => 'List of peminjaman',
            'data' => $peminjaman->items(),
            'pagination' => [
                'current_page' => $peminjaman->currentPage(),
                'last_page' => $peminjaman->lastPage(),
                'per_page' => $peminjaman->perPage(),
                'total' => $peminjaman->total(),
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
            'id_user' => 'required|exists:users,id',
            'tanggal_pinjam' => 'required|date',
            'tanggal_kembali' => 'required|date|after_or_equal:tanggal_pinjam',
            'kondisi' => 'required|string',
            'status' => 'required|string',
            'catatan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        $peminjaman = Peminjaman::create([
            'id_user' => $data['id_user'],
            'received_by' => $aktor->id,
            'tanggal_pinjam' => $data['tanggal_pinjam'],
            'tanggal_kembali' => $data['tanggal_kembali'],
            'kondisi' => $data['kondisi'],
            'status' => $data['status'],
            'catatan' => $data['catatan'],
        ]);

        Log::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Menambah peminjaman: ID {$peminjaman->id}",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Peminjaman berhasil ditambahkan',
            'data' => [
                'id' => $peminjaman->id,
                'id_user' => $peminjaman->id_user,
                'received_by' => $peminjaman->received_by,
                'tanggal_pinjam' => $peminjaman->tanggal_pinjam,
                'tanggal_kembali' => $peminjaman->tanggal_kembali,
                'kondisi' => $peminjaman->kondisi,
                'status' => $peminjaman->status,
                'catatan' => $peminjaman->catatan,
            ]
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Peminjaman $peminjaman)
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

        $peminjaman = Peminjaman::find($id);

        if (!$peminjaman) {
            return response()->json([
                'success' => false,
                'message' => 'Peminjaman tidak ditemukan'
            ], 404);
        }

        $data = $request->validate([
            'id_user' => 'exists:users,id',
            'received_by' => 'exists:users,id',
            'tanggal_pinjam' => 'date',
            'tanggal_kembali' => 'date|after_or_equal:tanggal_pinjam',
            'kondisi' => 'string',
            'status' => 'string',
            'catatan' => 'nullable|string',
        ]);

        $peminjaman->update($data);

        Log::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Memperbarui peminjaman: ID {$peminjaman->id}",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Peminjaman berhasil diperbarui',
            'data' => $peminjaman
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

        $peminjaman = Peminjaman::find($id);

        if (!$peminjaman) {
            return response()->json([
                'message' => 'Peminjaman tidak ditemukan'
            ], 404);
        }

        $peminjaman->delete();

        Log::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Menghapus peminjaman: ID {$peminjaman->id}",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Peminjaman berhasil dihapus'
        ]);
    }
}
