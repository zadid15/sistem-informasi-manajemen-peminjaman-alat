<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\AlatUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    // 1️⃣ Lihat cart user
    public function index()
    {
        $user = Auth::user();

        $cart = Cart::with([
            'items' => function ($q) {
                $q->where('status', 'active')
                    ->with(['alatUnit.alat']);
            }
        ])
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if ($cart) {
            $cart->items->transform(function ($item) {
                if ($item->alatUnit && $item->alatUnit->alat && $item->alatUnit->alat->foto_alat) {
                    $foto = $item->alatUnit->alat->foto_alat;
                    if (!str_starts_with($foto, 'http')) {
                        $item->alatUnit->alat->foto_alat = asset('storage/' . $foto);
                    }
                }
                return $item;
            });
        }

        return response()->json([
            'cart' => $cart,
            'items' => $cart ? $cart->items : [],
        ]);
    }

    // 2️⃣ Tambah item ke cart
    public function addItem(Request $request)
    {
        $request->validate([
            'alat_id'      => 'required|exists:alat,id',
            'alat_unit_id' => 'sometimes|exists:alat_unit,id',
            'jumlah'       => 'sometimes|integer|min:1',
        ]);

        $user = Auth::user();
        $cart = Cart::firstOrCreate(
            ['user_id' => $user->id, 'status' => 'active']
        );

        $jumlah = $request->jumlah ?? 1;

        $unitSedangDipinjam = \App\Models\DetailPeminjaman::whereHas('peminjaman', function ($q) use ($user) {
            $q->where('id_user', $user->id)
                ->whereNotIn('status', ['dikembalikan', 'dikembalikan_terlambat', 'ditolak']);
        })->pluck('id_alat_unit');

        // Cek sudah berapa unit alat yang sama di cart
        $unitDiCart = CartItem::where('cart_id', $cart->id)
            ->where('status', 'active')
            ->whereHas('alatUnit', fn($q) => $q->where('alat_id', $request->alat_id))
            ->count();

        // Cek total unit tersedia
        $totalTersedia = AlatUnit::where('alat_id', $request->alat_id)
            ->where('status', 'Tersedia')
            ->whereIn('kondisi', ['Baik', 'Layak Pakai'])
            ->count();

        if ($unitDiCart >= $totalTersedia) {
            return response()->json([
                'message' => 'Semua unit tersedia sudah ada di keranjang kamu'
            ], 409);
        }

        // Kalau alat_unit_id sudah dikirim (user pilih dari modal)
        if ($request->filled('alat_unit_id')) {
            $unit = AlatUnit::where('id', $request->alat_unit_id)
                ->where('alat_id', $request->alat_id)
                ->where('status', 'Tersedia')
                ->whereIn('kondisi', ['Baik', 'Layak Pakai'])
                ->whereNotIn('id', $unitSedangDipinjam)
                ->firstOrFail();

            // Cek unit spesifik ini sudah di cart
            $existsInCart = CartItem::where('cart_id', $cart->id)
                ->where('alat_unit_id', $unit->id)
                ->where('status', 'active')
                ->exists();

            if ($existsInCart) {
                return response()->json([
                    'message' => 'Unit ini sudah ada di keranjang kamu'
                ], 409);
            }
        } else {
            $unitsDiCartIds = CartItem::where('cart_id', $cart->id)
                ->where('status', 'active')
                ->whereHas('alatUnit', fn($q) => $q->where('alat_id', $request->alat_id))
                ->pluck('alat_unit_id');

            // Ambil unit tersedia yang belum di cart
            $availableUnits = AlatUnit::where('alat_id', $request->alat_id)
                ->where('status', 'Tersedia')
                ->whereIn('kondisi', ['Baik', 'Layak Pakai'])
                ->whereNotIn('id', $unitsDiCartIds)
                ->whereNotIn('id', $unitSedangDipinjam)
                ->get();

            if ($availableUnits->isEmpty()) {
                return response()->json([
                    'message' => 'Tidak ada unit yang tersedia untuk alat ini'
                ], 409);
            }

            if ($availableUnits->count() > 1) {
                return response()->json([
                    'action'  => 'select_unit',
                    'units'   => $availableUnits,
                    'message' => 'Pilih unit yang ingin dipinjam',
                ], 200);
            }

            $unit = $availableUnits->first();
        }

        $item = CartItem::create([
            'cart_id'      => $cart->id,
            'alat_unit_id' => $unit->id,
            'status'       => 'active',
            'is_selected'  => false,
        ]);

        return response()->json([
            'message'   => 'Alat berhasil ditambahkan ke keranjang',
            'cart_item' => $item->load('alatUnit.alat'),
        ], 201);
    }

    // 3️⃣ Checkout menggunakan stored procedure
    public function checkout(Request $request)
    {
        $user = Auth::user();

        $cart = Cart::with('items')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->firstOrFail();

        $totalSelected = DB::selectOne('SELECT count_selected_items(?) AS total', [$cart->id])->total;

        if ($totalSelected == 0) {
            return response()->json(['message' => 'Tidak ada item yang dipilih'], 400);
        }

        try {
            DB::transaction(function () use ($cart) {
                DB::statement('CALL checkout_cart(?)', [$cart->id]);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Checkout gagal: ' . $e->getMessage()], 500);
        }

        $cart->refresh();

        return response()->json([
            'cart'    => $cart->load('items'),
            'message' => 'Checkout berhasil',
        ]);
    }

    public function selectItem(Request $request, $itemId)
    {
        $request->validate([
            'is_selected' => 'required|boolean',
        ]);

        $user = Auth::user();

        $item = CartItem::where('id', $itemId)
            ->whereHas('cart', fn($q) => $q->where('user_id', $user->id)->where('status', 'active'))
            ->firstOrFail();

        $item->update(['is_selected' => $request->is_selected]);

        return response()->json($item);
    }
}
