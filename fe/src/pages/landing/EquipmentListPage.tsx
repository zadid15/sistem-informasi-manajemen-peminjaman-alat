import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router";
import { Search } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

import { getListKategori } from "../../services/kategoriService";
import type { SimpleKategori } from "../../types/kategori";
import type { Alat } from "../../types/alat";
import { getListAlat } from "../../services/alatService";
import axiosInstance from "../../utils/axios";

type Banner = {
  id: number;
  title: string;
  image_url: string;
};

export function EquipmentListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [currentBanner, setCurrentBanner] = useState(0);

  const [kategori, setKategori] = useState<SimpleKategori[]>([]);
  const [alat, setAlat] = useState<Alat[]>([]);

  const [loadingKategori, setLoadingKategori] = useState(true);
  const [loadingAlat, setLoadingAlat] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanner, setLoadingBanner] = useState(true);

  const [nextPage, setNextPage] = useState<number | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);

  /* ===================== FETCH KATEGORI ===================== */
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchKategori = async () => {
        try {
          setLoadingKategori(true);
          const res = await getListKategori();
          setKategori(res.kategori);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingKategori(false);
        }
      };
      fetchKategori();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  /* ===================== FETCH BANNER ===================== */
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axiosInstance.get("/banners");
        setBanners(res.data.banners);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBanner(false);
      }
    };
    fetchBanners();
  }, []);

  /* ===================== FETCH ALAT (reset saat filter/search berubah) ===================== */
  useEffect(() => {
    setLoadingAlat(true);
    setAlat([]);
    setNextPage(null);

    const timer = setTimeout(async () => {
      try {
        const res = await getListAlat({
          search: searchQuery,
          kategori: selectedCategory,
          page: 1,
        });
        setAlat(res.alat);
        setNextPage(res.nextPage);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAlat(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  /* ===================== LOAD MORE ===================== */
  const loadMore = useCallback(async () => {
    if (!nextPage || loadingMore || loadingAlat) return;

    setLoadingMore(true);
    try {
      const res = await getListAlat({
        search: searchQuery,
        kategori: selectedCategory,
        page: nextPage,
      });
      setAlat((prev) => [...prev, ...res.alat]);
      setNextPage(res.nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [nextPage, loadingMore, loadingAlat, searchQuery, selectedCategory]);

  /* ===================== INTERSECTION OBSERVER ===================== */
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  /* ===================== SCROLL RESET ===================== */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ===================== AUTO SLIDE ===================== */
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  /* ===================== SKELETONS ===================== */
  const CategorySkeleton = () => (
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-9 w-28 rounded-full bg-gray-200 animate-pulse"
        />
      ))}
    </div>
  );

  const AlatSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse"
        >
          <div className="relative aspect-square bg-gray-200">
            <div className="absolute top-4 right-4 h-6 w-20 rounded-full bg-gray-300" />
          </div>
          <div className="p-6 space-y-3">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-5 w-3/4 bg-gray-300 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-5/6 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-32 bg-gray-200 rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  const LoadMoreSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse"
        >
          <div className="relative aspect-square bg-gray-200" />
          <div className="p-6 space-y-3">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-5 w-3/4 bg-gray-300 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-5/6 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-32 bg-gray-200 rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* ===================== HEADER ===================== */}
      <section className="pt-52 pb-12 px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Jelajahi Peralatan Kami
          </h1>
          <p className="text-lg text-gray-600">
            Temukan berbagai peralatan yang tersedia untuk dipinjam
          </p>
        </div>
      </section>

      {/* ===================== FILTER ===================== */}
      <section className="max-w-7xl mx-auto bg-lime-800/95 backdrop-blur-md border-b border-gray-100 shadow-sm rounded-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari peralatan ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-200 text-gray-800 pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-3 mb-4">
            {loadingKategori ? (
              <CategorySkeleton />
            ) : (
              <>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`
                    group relative px-5 py-2 rounded-full font-medium text-sm transition-all cursor-pointer
                    ${selectedCategory === null
                      ? "bg-lime-400 text-gray-900 shadow-md shadow-lime-500/20"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }
                    after:content-[''] after:absolute after:-bottom-2 after:left-0 after:h-[2px] 
                    after:w-0 after:rounded-full after:bg-lime-400 after:transition-all after:duration-300 after:ease-out
                    hover:after:w-full
                  `}
                >
                  Semua
                  {selectedCategory === null && (
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-lime-400 rounded-full" />
                  )}
                </button>

                {kategori.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCategory(item.id)}
                    className={`
                      group relative px-5 py-2 rounded-full font-medium text-sm transition-all cursor-pointer
                      ${selectedCategory === item.id
                        ? "bg-lime-400 text-gray-900 shadow-md shadow-lime-500/20"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }
                      after:content-[''] after:absolute after:-bottom-2 after:left-0 after:h-[2px] 
                      after:w-0 after:rounded-full after:bg-lime-400 after:transition-all after:duration-300 after:ease-out
                      hover:after:w-full
                    `}
                  >
                    {item.nama_kategori}
                    {selectedCategory === item.id && (
                      <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-lime-400 rounded-full" />
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ===================== BANNER ===================== */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-8 mt-12 py-12 h-70 overflow-hidden rounded-2xl bg-gray-100">
        {loadingBanner ? (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-2xl" />
        ) : banners.length === 0 ? null : (
          <>
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBanner
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0"
                  }`}
              >
                <ImageWithFallback
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`h-2 transition-all duration-300 ${currentBanner === idx
                    ? "w-8 bg-white rounded-full"
                    : "w-3 bg-white/50 rounded-full hover:bg-white"
                    }`}
                  aria-label={`Ke slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ===================== GRID ===================== */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Grid */}
          {loadingAlat ? (
            <AlatSkeleton />
          ) : alat.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {alat.map((item) => (
                  <Link
                    key={item.id}
                    to={`/detail-alat/${item.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-lime-400"
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden relative">
                      <ImageWithFallback
                        src={
                          item.foto_alat instanceof File
                            ? URL.createObjectURL(item.foto_alat)
                            : item.foto_alat ?? undefined
                        }
                        alt={item.nama_alat}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {item.kategori.nama_kategori}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-2 group-hover:text-lime-600 transition-colors">
                        {item.nama_alat}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.deskripsi}
                      </p>

                      {/* Tambahkan ini */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full ${(item.unit_tersedia ?? 0) > 0
                          ? "bg-lime-50 text-lime-700"
                          : "bg-red-50 text-red-600"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${(item.unit_tersedia ?? 0) > 0 ? "bg-lime-500" : "bg-red-500"}`} />
                          {(item.unit_tersedia ?? 0) > 0 ? `${item.unit_tersedia} unit tersedia` : "Tidak tersedia"}
                        </span>
                      </div>

                      <div className="mt-4 text-sm font-medium text-lime-500 group-hover:text-lime-600">
                        View Details →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Sentinel — dipantau IntersectionObserver */}
              <div ref={sentinelRef} className="h-10 mt-6" />

              {/* Skeleton saat load more */}
              {loadingMore && <LoadMoreSkeleton />}

            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Alat tidak ditemukan
              </h3>
              <p className="text-gray-600">
                Coba sesuaikan filter atau kata kunci pencarian
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}