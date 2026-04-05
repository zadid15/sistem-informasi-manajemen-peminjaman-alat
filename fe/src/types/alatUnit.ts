export type AlatUnitKondisi = 'Baik' | 'Layak Pakai' | 'Perlu Perawatan' | 'Rusak Ringan' | 'Rusak Berat' | 'Dalam Servis' | 'Tidak Layak Pakai';

export type AlatUnitStatus = 'Tersedia' | 'Dipinjam' | 'Tidak Tersedia';

export interface AlatUnit {
    id: number;
    kode_unit: string;
    kondisi: AlatUnitKondisi;
    status: AlatUnitStatus;
    lokasi: string;
    id_alat: number;
}

export type CreateAlatUnitForm = {
    jumlah_unit: number;
    kondisi: AlatUnitKondisi;
    lokasi: string;
    status: AlatUnitStatus;
};

export type UpdateAlatUnitForm = {
    kondisi: AlatUnitKondisi;
    lokasi: string;
    status: AlatUnitStatus;
};

export type AlatUnitArray = AlatUnit[];