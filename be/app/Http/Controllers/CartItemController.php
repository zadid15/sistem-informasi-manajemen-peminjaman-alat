<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartItemController extends Controller
{
    // 1️⃣ Update item (select/unselect)
    public function update(Request $request, $itemId)
    {
        $request->validate([
            'is_selected' => 'sometimes|boolean',
        ]);

        $user = Auth::user();

        $item = CartItem::where('id', $itemId)
            ->whereHas('cart', fn($q) => $q->where('user_id', $user->id)->where('status', 'active'))
            ->firstOrFail();

        $item->update($request->only('is_selected'));

        return response()->json($item->load('alatUnit.alat'));
    }

    // 2️⃣ Hapus item dari cart
    public function destroy($itemId)
    {
        $user = Auth::user();

        $item = CartItem::where('id', $itemId)
            ->whereHas('cart', fn($q) => $q->where('user_id', $user->id)->where('status', 'active'))
            ->firstOrFail();

        $item->delete();

        return response()->json(['message' => 'Item dihapus dari cart']);
    }

    // 3️⃣ Checkout item yang dipilih
    public function checkout($cartId)
    {
        $user = Auth::user();

        $cart = Cart::where('id', $cartId)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->firstOrFail();

        $selectedCount = DB::selectOne("SELECT count_selected_items(?) AS total", [$cartId])->total;

        if ($selectedCount == 0) {
            return response()->json(['message' => 'Tidak ada item yang dipilih untuk checkout'], 400);
        }

        try {
            DB::transaction(function () use ($cartId) {
                DB::statement("CALL checkout_cart(?)", [$cartId]);
            });

            $cart->refresh()->load('items.alatUnit.alat');

            return response()->json([
                'message'              => 'Checkout berhasil',
                'cart'                 => $cart,
                'selected_items_count' => $selectedCount,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Checkout gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    // 4️⃣ Tampilkan item tertentu
    public function show($itemId)
    {
        $user = Auth::user();

        $item = CartItem::with('alatUnit.alat')
            ->where('id', $itemId)
            ->whereHas('cart', fn($q) => $q->where('user_id', $user->id))
            ->firstOrFail();

        return response()->json($item);
    }
}
