<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
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

        $query = User::select('id', 'nama', 'email', 'role', 'is_active', 'phone');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate(10);

        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'nama' => $user->nama,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'phone' => $user->phone,
            ];
        });

        return response()->json([
            'message' => 'List of users',
            'data' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
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
            'nama' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'string', 'min:8', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
            'role' => 'required|string|in:admin,petugas,peminjam',
            'phone' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        UserLog::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Menambahkan user baru: {$user->nama} (ID: {$user->id})",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'User berhasil ditambahkan',
            'data' => $user
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

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User tidak ditemukan'
            ], 404);
        } else {
            return response()->json([
                'message' => 'Detail user',
                'data' => $user
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

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        $data = $request->validate([
            'nama' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'password' => ['sometimes', 'required', 'string', 'min:8', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
            'role' => 'sometimes|required|string|in:admin,petugas,peminjam',
            'phone' => 'sometimes|required|string',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        UserLog::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Memperbarui user: {$user->nama} (ID: {$user->id})",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'User berhasil diperbarui',
            'data' => $user
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

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        $user->delete();

        UserLog::create([
            'user_id' => $aktor->id,
            'aktor' => $aktor->nama,
            'aktivitas' => "Menghapus user: {$user->nama} (ID: {$user->id})",
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'User berhasil dihapus'
        ]);
    }
}
