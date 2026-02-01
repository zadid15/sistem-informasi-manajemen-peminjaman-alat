<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
        ]);

        $user = User::create([
            'nama' => $validated['nama'], 
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'peminjam', 
        ]);

        Log::create([
            'user_id' => $user->id,
            'aktor' => '-',
            'aktivitas' => 'register',
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Registrasi berhasil'
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        Log::create([
            'user_id' => $user->id,
            'aktor' => '-',
            'aktivitas' => 'login',
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'token' => $token,
            'user' => [
                'nama' => $user->nama,
                'role' => $user->role,
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            Log::create([
                'user_id' => $request->user()->id,
                'aktor' => '-',
                'aktivitas' => 'logout',
                'ip' => $request->ip(),
            ]);

            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Logout berhasil'
            ], 200);
        }

        return response()->json([
            'message' => 'Token tidak valid'
        ], 401);
    }

    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $exists = User::where('email', $request->email)->exists();

        return response()->json([
            'exists' => $exists
        ]);
    }
}
