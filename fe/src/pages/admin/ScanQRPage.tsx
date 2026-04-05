import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { QrCode, Camera, CameraOff, RotateCcw, Package, MapPin, Tag, User, Calendar, CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import axiosInstance from "../../utils/axios";

type UnitResult = {
    id: number;
    kode_unit: string;
    kondisi: string;
    status: string;
    lokasi: string;
    alat: {
        id: number;
        nama_alat: string;
        foto_alat?: string | null;
        kategori?: { nama_kategori: string } | null;
    };
    detail_peminjaman?: {
        peminjaman?: {
            id: number;
            status: string;
            tanggal_pinjam: string;
            rencana_pengembalian: string;
            user?: { nama: string; email: string };
        };
    }[];
};

const statusColors: Record<string, string> = {
    Tersedia: "bg-green-700 text-white",
    Dipinjam: "bg-yellow-500 text-white",
    "Tidak Tersedia": "bg-red-700 text-white",
};

const kondisiColors: Record<string, string> = {
    Baik: "bg-green-700 text-white",
    "Layak Pakai": "bg-blue-700 text-white",
    "Perlu Perawatan": "bg-yellow-500 text-white",
    "Rusak Ringan": "bg-orange-500 text-white",
    "Rusak Berat": "bg-red-700 text-white",
    "Dalam Servis": "bg-purple-700 text-white",
    "Tidak Layak Pakai": "bg-gray-700 text-white",
};

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export default function ScanQRPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<{ stop: () => void } | null>(null);

    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<UnitResult | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [lastScanned, setLastScanned] = useState<string | null>(null);

    const storageUrl = (path: string) =>
        `${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${path}`;

    const playBeep = () => {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    };

    const fetchUnit = async (kode: string) => {
        setLoading(true);
        setNotFound(false);
        setResult(null);
        try {
            const res = await axiosInstance.get(`/alat-unit/cari-kode/${kode}`);
            setResult(res.data.unit);
        } catch {
            setNotFound(true);
            toast.error("Unit tidak ditemukan");
        } finally {
            setLoading(false);
        }
    };

    const startCamera = useCallback(async () => {
        setScanning(true);
        setResult(null);
        setNotFound(false);
        setTimeout(async () => {
            if (!videoRef.current) return;
            const reader = new BrowserQRCodeReader();
            try {
                const controls = await reader.decodeFromVideoDevice(
                    undefined,
                    videoRef.current,
                    (res) => {
                        if (res) {
                            const kode = res.getText();
                            controls.stop();
                            controlsRef.current = null;
                            setScanning(false);
                            setLastScanned(kode);
                            playBeep();
                            fetchUnit(kode);
                        }
                    }
                );
                controlsRef.current = controls;
            } catch {
                toast.error("Gagal mengakses kamera");
                setScanning(false);
            }
        }, 300);
    }, []);

    const stopCamera = () => {
        controlsRef.current?.stop();
        controlsRef.current = null;
        setScanning(false);
    };

    const reset = () => {
        setResult(null);
        setNotFound(false);
        setLastScanned(null);
        startCamera();
    };

    useEffect(() => {
        startCamera();
        return () => controlsRef.current?.stop();
    }, [startCamera]);

    const activePeminjaman = result?.detail_peminjaman?.[0]?.peminjaman;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Scan QR Unit</h1>
                <p className="text-gray-600 text-md mt-1">Arahkan kamera ke QR code yang tertempel di unit alat</p>
            </div>

            <div className="flex gap-6 items-start">
                {/* Kiri - Kamera */}
                <div className="bg-white rounded-xl border overflow-hidden w-96 flex-shrink-0">
                    <div className="px-6 py-4 bg-lime-800 text-white font-semibold flex items-center gap-2">
                        <QrCode className="w-5 h-5" />
                        <span>Kamera Scanner</span>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className={`relative rounded-xl overflow-hidden bg-black aspect-square ${scanning ? "" : "opacity-50"}`}>
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                style={{ transform: "scaleX(-1)" }}
                            />
                            {scanning && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-48 h-48 border-4 border-white/70 rounded-xl relative">
                                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-lime-400 rounded-tl" />
                                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-lime-400 rounded-tr" />
                                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-lime-400 rounded-bl" />
                                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-lime-400 rounded-br" />
                                    </div>
                                </div>
                            )}
                            {!scanning && !loading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <CameraOff className="w-12 h-12 text-white/50" />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {scanning ? (
                                <Button variant="outline" className="flex-1 cursor-pointer" onClick={stopCamera}>
                                    <CameraOff className="w-4 h-4 mr-2" /> Stop Kamera
                                </Button>
                            ) : (
                                <Button className="flex-1 cursor-pointer bg-lime-800 hover:bg-lime-700" onClick={startCamera}>
                                    <Camera className="w-4 h-4 mr-2" /> Mulai Scan
                                </Button>
                            )}
                            {(result || notFound) && (
                                <Button variant="outline" className="cursor-pointer" onClick={reset}>
                                    <RotateCcw className="w-4 h-4 mr-2" /> Scan Lagi
                                </Button>
                            )}
                        </div>

                        {lastScanned && (
                            <p className="text-sm text-gray-500 text-center">
                                Terakhir scan: <span className="font-mono font-semibold">{lastScanned}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Kanan - Hasil */}
                <div className="flex-1">
                    {/* Placeholder */}
                    {!loading && !result && !notFound && (
                        <div className="bg-white rounded-xl border p-12 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                <QrCode className="w-8 h-8 text-gray-300" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-400">Belum ada hasil scan</p>
                                <p className="text-sm text-gray-300 mt-1">Arahkan kamera ke QR code unit alat</p>
                            </div>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="bg-white rounded-xl border p-12 flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-lime-700 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-500">Mencari unit...</p>
                        </div>
                    )}

                    {/* Not Found */}
                    {notFound && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-10 flex flex-col items-center justify-center gap-3 text-center">
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                <Package className="w-7 h-7 text-red-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-red-800">Unit Tidak Ditemukan</p>
                                <p className="text-sm text-red-500 mt-1">
                                    Kode <span className="font-mono font-bold">{lastScanned}</span> tidak terdaftar di sistem.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {result && !loading && (
                        <div className="bg-white rounded-xl border overflow-hidden">
                            <div className="px-6 py-4 bg-lime-800 text-white font-semibold flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                <span>Informasi Unit</span>
                            </div>
                            <div className="p-6 space-y-5">
                                {/* Alat info */}
                                <div className="flex items-start gap-4">
                                    {result.alat.foto_alat ? (
                                        <img
                                            src={storageUrl(result.alat.foto_alat)}
                                            alt={result.alat.nama_alat}
                                            className="w-20 h-20 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <Package className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <p className="text-lg font-bold text-gray-900">{result.alat.nama_alat}</p>
                                        <p className="font-mono text-sm text-gray-500">{result.kode_unit}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge className={`${statusColors[result.status] ?? "bg-gray-300"} text-xs uppercase`}>{result.status}</Badge>
                                            <Badge className={`${kondisiColors[result.kondisi] ?? "bg-gray-300"} text-xs uppercase`}>{result.kondisi}</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-md">
                                    {result.alat.kategori && (
                                        <div className="flex items-start gap-2">
                                            <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-gray-500 text-sm">Kategori</p>
                                                <p className="font-medium">{result.alat.kategori.nama_kategori}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-gray-500 text-sm">Lokasi</p>
                                            <p className="font-medium">{result.lokasi || "-"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Peminjaman aktif */}
                                {activePeminjaman && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
                                        <p className="text-sm font-semibold text-yellow-800">Sedang Dipinjam</p>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-start gap-2">
                                                <User className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-yellow-700 text-xs">Peminjam</p>
                                                    <p className="font-medium text-yellow-900">{activePeminjaman.user?.nama ?? "-"}</p>
                                                    <p className="text-xs text-yellow-600">{activePeminjaman.user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Calendar className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-yellow-700 text-xs">Rencana Kembali</p>
                                                    <p className="font-medium text-yellow-900">{formatDate(activePeminjaman.rencana_pengembalian)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {result.status === "Tersedia" && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <p className="text-sm text-green-700 font-medium flex items-center gap-1.5">
                                            <CheckCircle className="w-4 h-4" /> Unit tersedia dan siap dipinjam
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
