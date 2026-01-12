<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
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

        UserLog::create([
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
            UserLog::create([
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
}
