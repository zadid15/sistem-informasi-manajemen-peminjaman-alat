<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Http\Request;

class LogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $aktor = $request->user();

        if (!$aktor || $aktor->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang bisa mengakses.'], 403);
        }

        $search  = $request->query('search', '');
        $perPage = $request->query('per_page', 15);

        $logs = Log::with('user:id,nama,role')
            ->when(
                $search,
                fn($q) => $q
                    ->where('aktor', 'like', "%{$search}%")
                    ->orWhere('aktivitas', 'like', "%{$search}%")
                    ->orWhere('ip', 'like', "%{$search}%")
            )
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'per_page'     => $logs->perPage(),
                'total'        => $logs->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Log $Log)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Log $Log)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Log $Log)
    {
        //
    }
}
