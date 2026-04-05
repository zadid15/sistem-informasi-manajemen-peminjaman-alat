export type KondisiColors = {
    Baik: string;
    "Rusak Ringan": string;
    "Rusak Berat": string;
    "Layak Pakai": string;
    "Perlu Perawatan": string;
    "Dalam Servis": string;
    "Tidak Layak Pakai": string;
} & { [key: string]: string };

export const kondisiColors: KondisiColors = {
    Baik: "bg-green-300 text-green-800",
    "Rusak Ringan": "bg-yellow-100 text-yellow-800",
    "Rusak Berat": "bg-red-100 text-red-800",
    "Layak Pakai": "bg-green-100 text-green-800",
    "Perlu Perawatan": "bg-yellow-300 text-yellow-800",
    "Dalam Servis": "bg-yellow-100 text-yellow-800",
    "Tidak Layak Pakai": "bg-red-100 text-red-800",
};