<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::where('aktif', true)->orderBy('urutan')->get();
        return response()->json(['banners' => $banners]);
    }

    public function indexAdmin()
    {
        $banners = Banner::orderBy('urutan')->get();
        return response()->json(['banners' => $banners]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'  => 'required|string|max:255',
            'image'  => 'required|image|max:4096',
            'urutan' => 'nullable|integer',
            'aktif'  => 'nullable|boolean',
        ]);

        $path = $request->file('image')->store('banners', 'public');

        $banner = Banner::create([
            'title'  => $data['title'],
            'image'  => $path,
            'urutan' => $data['urutan'] ?? 0,
            'aktif'  => $data['aktif'] ?? true,
        ]);

        return response()->json(['message' => 'Banner berhasil dibuat', 'banner' => $banner], 201);
    }

    public function update(Request $request, Banner $banner)
    {
        $data = $request->validate([
            'title'  => 'sometimes|string|max:255',
            'image'  => 'sometimes|image|max:4096',
            'urutan' => 'sometimes|integer',
            'aktif'  => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($banner->image);
            $data['image'] = $request->file('image')->store('banners', 'public');
        }

        $banner->update($data);

        return response()->json(['message' => 'Banner berhasil diupdate', 'banner' => $banner]);
    }

    public function destroy(Banner $banner)
    {
        Storage::disk('public')->delete($banner->image);
        $banner->delete();
        return response()->json(['message' => 'Banner berhasil dihapus']);
    }
}
