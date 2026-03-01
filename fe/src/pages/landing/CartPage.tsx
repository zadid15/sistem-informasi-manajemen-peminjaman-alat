import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import {
    deleteCartItem,
    getCart,
    toggleCartItem,
} from "../../services/cartService";
import type { CartItem } from "../../types/cart";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";

type GroupedItem = {
    alat: CartItem["alat_unit"]["alat"];
    units: CartItem[];
};

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const navigate = useNavigate();
    const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
    const [groupToDelete, setGroupToDelete] = useState<GroupedItem | null>(null);
    const selectAllRef = useRef<HTMLInputElement>(null);

    const loadCart = async () => {
        try {
            const res = await getCart();
            await new Promise(resolve => setTimeout(resolve, 1000));
            setItems(res.items);
        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat keranjang");
        }
    };

    useEffect(() => {
        loadCart().finally(() => setLoading(false));
    }, []);

    const selectedItems = items.filter(i => i.is_selected);
    const selectedCount = selectedItems.length;

    const groupedItems = items.reduce((acc, item) => {
        const alatId = item.alat_unit.alat.id;
        if (!acc[alatId]) {
            acc[alatId] = { alat: item.alat_unit.alat, units: [] };
        }
        acc[alatId].units.push(item);
        return acc;
    }, {} as Record<number, GroupedItem>);

    const groupedList = Object.values(groupedItems);

    const toggleSelect = async (id: number, current: boolean) => {
        setItems(prev =>
            prev.map(item => item.id === id ? { ...item, is_selected: !current } : item)
        );
        try {
            await toggleCartItem(id, !current);
        } catch {
            setItems(prev =>
                prev.map(item => item.id === id ? { ...item, is_selected: current } : item)
            );
            toast.error("Gagal mengubah pilihan item");
        }
    };

    const toggleSelectAll = async () => {
        const allSelected = selectedCount === items.length;
        setItems(prev => prev.map(i => ({ ...i, is_selected: !allSelected })));
        try {
            const updatedItems = items.map(i => ({ ...i, is_selected: !allSelected }));
            await Promise.all(updatedItems.map(i => toggleCartItem(i.id, i.is_selected)));
        } catch {
            setItems(prev => prev.map(i => ({ ...i, is_selected: allSelected })));
            toast.error("Gagal memilih semua item");
        }
    };

    const toggleSelectGroup = async (group: GroupedItem) => {
        const allSelected = group.units.every(u => u.is_selected);
        const groupIds = group.units.map(u => u.id);
        setItems(prev =>
            prev.map(item =>
                groupIds.includes(item.id) ? { ...item, is_selected: !allSelected } : item
            )
        );
        try {
            await Promise.all(group.units.map(u => toggleCartItem(u.id, !allSelected)));
        } catch {
            setItems(prev =>
                prev.map(item =>
                    groupIds.includes(item.id) ? { ...item, is_selected: allSelected } : item
                )
            );
            toast.error("Gagal memilih unit");
        }
    };

    const removeItem = async (id: number) => {
        try {
            setSyncing(true);
            await deleteCartItem(id);
            await loadCart();
        } catch {
            toast.error("Gagal menghapus item");
        } finally {
            setSyncing(false);
            setItemToDelete(null);
        }
    };

    const removeGroup = async (group: GroupedItem) => {
        try {
            setSyncing(true);
            await Promise.all(group.units.map(u => deleteCartItem(u.id)));
            await loadCart();
        } catch {
            toast.error("Gagal menghapus semua unit");
        } finally {
            setSyncing(false);
            setGroupToDelete(null);
        }
    };

    useEffect(() => {
        if (!selectAllRef.current) return;
        selectAllRef.current.indeterminate = selectedCount > 0 && selectedCount < items.length;
    }, [selectedCount, items.length]);

    if (loading) {
        return (
            <div className="pt-[150px]">
                <section className="pb-12 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white animate-pulse">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-12 w-1/3 bg-gray-200 rounded mb-4" />
                        <div className="h-6 w-1/2 bg-gray-200 rounded" />
                    </div>
                </section>
                <div className="px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto space-y-4 pb-6">
                        {Array.from({ length: 3 }).map((_, i) => <CartItemSkeleton key={i} />)}
                    </div>
                </div>
                <div className="sticky bottom-0 bg-white border-t animate-pulse">
                    <div className="px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto flex justify-between items-center py-4">
                            <div className="h-4 w-24 bg-gray-200 rounded" />
                            <div className="h-10 w-28 bg-gray-200 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="pt-[150px]">
                <section className="pb-12 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Keranjang Saya</h1>
                        <p className="text-lg text-gray-600">Belum ada alat di keranjangmu, ayo tambahkan alat yang ingin dipinjam!</p>
                    </div>
                </section>
                <div className="flex flex-col items-center justify-center gap-3 mt-12 text-gray-400">
                    <ShoppingCart size={48} strokeWidth={1.5} />
                    <p className="text-center">Keranjang kosong</p>
                    <button
                        onClick={() => navigate("/list-peralatan")}
                        className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition cursor-pointer"
                    >
                        Pinjam Alat
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-[150px]">
            {/* Header */}
            <section className="pb-12 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Keranjang Saya</h1>
                    <p className="text-lg text-gray-600">Pilih alat yang ingin kamu pinjam dari keranjangmu</p>
                </div>
            </section>

            {/* Content */}
            <div className="px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-4 pb-6">
                    {/* Select All */}
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                ref={selectAllRef}
                                type="checkbox"
                                checked={selectedCount === items.length && items.length > 0}
                                disabled={syncing || items.length === 0}
                                onChange={toggleSelectAll}
                                className="h-4 w-4 accent-gray-900 cursor-pointer"
                            />
                            <span className="font-semibold text-gray-700">Pilih Semua</span>
                        </label>
                        <span className="text-sm text-gray-400">{items.length} item total</span>
                    </div>

                    {/* Grouped Items */}
                    {groupedList.map((group) => {
                        const allGroupSelected = group.units.every(u => u.is_selected);
                        const someGroupSelected = group.units.some(u => u.is_selected);
                        const groupSelectedCount = group.units.filter(u => u.is_selected).length;

                        return (
                            <div key={group.alat.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                                    <input
                                        type="checkbox"
                                        checked={allGroupSelected}
                                        ref={el => {
                                            if (el) el.indeterminate = someGroupSelected && !allGroupSelected;
                                        }}
                                        disabled={syncing}
                                        onChange={() => toggleSelectGroup(group)}
                                        className="h-4 w-4 accent-gray-900 cursor-pointer flex-shrink-0"
                                    />
                                    <img
                                        src={typeof group.alat.foto_alat === "string" && group.alat.foto_alat
                                            ? group.alat.foto_alat
                                            : undefined
                                        }
                                        alt={group.alat.nama_alat}
                                        className="w-14 h-14 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{group.alat.nama_alat}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {group.units.length} unit di keranjang
                                            {groupSelectedCount > 0 && (
                                                <span className="ml-1 text-lime-600 font-medium">
                                                    · {groupSelectedCount} dipilih
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <button
                                        disabled={syncing}
                                        onClick={() => setGroupToDelete(group)}
                                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 disabled:opacity-50 cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50 transition flex-shrink-0"
                                    >
                                        <Trash2 size={14} />
                                        <span>Hapus semua</span>
                                    </button>
                                </div>

                                <div className="divide-y divide-gray-50">
                                    {group.units.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                                            <div className="w-4 flex-shrink-0" />
                                            <input
                                                type="checkbox"
                                                checked={item.is_selected}
                                                disabled={syncing}
                                                onChange={() => toggleSelect(item.id, item.is_selected)}
                                                className="h-4 w-4 accent-gray-900 cursor-pointer flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800">{item.alat_unit.kode_unit}</p>
                                                <p className="text-xs text-gray-400">{item.alat_unit.lokasi}</p>
                                            </div>
                                            <button
                                                disabled={syncing}
                                                onClick={() => setItemToDelete(item)}
                                                className="text-red-400 hover:text-red-600 disabled:opacity-50 cursor-pointer p-1 rounded hover:bg-red-50 transition flex-shrink-0"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Dialogs */}
            <ConfirmDialog
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={() => { if (itemToDelete) removeItem(itemToDelete.id); }}
                title="Hapus unit ini?"
                description={itemToDelete ? `${itemToDelete.alat_unit.alat.nama_alat} — ${itemToDelete.alat_unit.kode_unit}` : ""}
                confirmText="Hapus"
                variant="danger"
            />
            <ConfirmDialog
                isOpen={!!groupToDelete}
                onClose={() => setGroupToDelete(null)}
                onConfirm={() => { if (groupToDelete) removeGroup(groupToDelete); }}
                title="Hapus semua unit?"
                description={groupToDelete ? `Semua ${groupToDelete.units.length} unit ${groupToDelete.alat.nama_alat} akan dihapus dari keranjang.` : ""}
                confirmText="Hapus Semua"
                variant="danger"
            />

            {/* Checkout Bar */}
            <div className="sticky bottom-0 bg-white border-t border-b mb-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
                <div className="px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex justify-between items-center py-4">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">{selectedCount}</span> item dipilih
                        </p>
                        <button
                            disabled={syncing || selectedCount === 0}
                            onClick={() => navigate("/submit-peminjaman", {
                                state: { fromCart: true, selectedItems },
                            })}
                            className="px-8 py-3 bg-gray-900 text-white rounded-xl disabled:opacity-50 cursor-pointer hover:bg-black transition font-medium"
                        >
                            Pinjam ({selectedCount})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CartItemSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
            <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                <div className="h-4 w-4 rounded bg-gray-200 flex-shrink-0" />
                <div className="w-14 h-14 rounded-lg bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    <div className="h-3 w-1/4 bg-gray-200 rounded" />
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded flex-shrink-0" />
            </div>
            <div className="px-4 py-3 space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-4 flex-shrink-0" />
                        <div className="h-4 w-4 rounded bg-gray-200 flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                            <div className="h-3 w-24 bg-gray-200 rounded" />
                            <div className="h-3 w-16 bg-gray-200 rounded" />
                        </div>
                        <div className="h-5 w-16 bg-gray-200 rounded-full flex-shrink-0" />
                        <div className="h-4 w-4 bg-gray-200 rounded flex-shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}