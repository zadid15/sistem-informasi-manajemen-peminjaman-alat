export type CartItem = {
    id: number;
    cart_id: number;
    alat_unit_id: number;
    is_selected: boolean;
    status: string;
    alat_unit: {
        id: number;
        kode_unit: string;
        kondisi: string;
        lokasi: string;
        status: string;
        alat: {
            id: number;
            nama_alat: string;
            deskripsi: string;
            foto_alat: string | File | null;
            batas_peminjaman: number;
        };
    };
};
