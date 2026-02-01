<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;


class MeController extends Controller
{
    // 🔹 GET /me
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'message' => 'Data user login',
            'data' => [
                ...$user->toArray(),
                'foto' => $user->foto
                    ? asset('storage/' . $user->foto)
                    : null,
            ]
        ]);
    }


    // 🔹 PUT /me
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'nama' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $user->id,
            'alamat' => 'sometimes|string',
            'jenis_kelamin' => 'sometimes|string|in:Laki-laki,Perempuan',
            'phone' => 'sometimes|string',
            'foto' => 'sometimes|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        // 🖼️ upload foto (jika ada)
        if ($request->hasFile('foto')) {
            // hapus foto lama
            if ($user->foto && Storage::disk('public')->exists($user->foto)) {
                Storage::disk('public')->delete($user->foto);
            }

            $file = $request->file('foto');
            $filename = uniqid('me_') . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('user', $filename, 'public');

            $data['foto'] = $path;
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'data' => [
                ...$user->toArray(),
                'foto' => $user->foto
                    ? asset('storage/' . $user->foto)
                    : null,
            ]
        ]);
    }

    // 🔹 PUT /me/password
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'min:8', 'confirmed'],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama salah'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Password berhasil diubah'
        ]);
    }
}
