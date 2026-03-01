import axios from "axios";
import axiosInstance from "../utils/axios";

export const addToCart = async (alatId: number, alatUnitId?: number) => {
    try {
        const res = await axiosInstance.post("/cart/items", {
            alat_id: alatId,
            ...(alatUnitId ? { alat_unit_id: alatUnitId } : {}),
        });

        window.dispatchEvent(new Event("cartUpdated"));

        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error.response?.data?.message ?? "Terjadi kesalahan";
        }
        throw "Unexpected error";
    }
};

export const getCart = async () => {
    const res = await axiosInstance.get("/cart");
    return res.data;
};

export const toggleCartItem = (id: number, isSelected: boolean) => {
    return axiosInstance.patch(`/cart/items/${id}/select`, {
        is_selected: isSelected,
    });
};

export const deleteCartItem = async (id: number) => {
    const res = await axiosInstance.delete(`/cart-item/${id}`);
    window.dispatchEvent(new Event("cartUpdated"));
    return res.data;
};

export const checkoutCart = () => {
    return axiosInstance.post("/cart/checkout");
};

export const getCartCount = async (): Promise<number> => {
    try {
        const res = await axiosInstance.get("/cart");
        const items = res.data.items ?? [];
        return items.length;
    } catch {
        return 0;
    }
};