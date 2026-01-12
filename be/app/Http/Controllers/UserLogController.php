<?php

namespace App\Http\Controllers;

use App\Models\UserLog;
use Illuminate\Http\Request;

class UserLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $aktor = request()->user();

        if (!$aktor || $aktor->role !== 'admin') {
            return response()->json([
                'message' => 'Hanya admin yang bisa mengakses.'
            ], 403);
        }

        $logs = UserLog::orderBy('created_at', 'desc')->paginate(5);

        return response()->json([
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
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
    public function show(UserLog $userLog)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserLog $userLog)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserLog $userLog)
    {
        //
    }
}
