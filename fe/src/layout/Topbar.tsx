import { useState } from 'react';
import { Settings, LogOut, ChevronDown, User } from 'lucide-react';

interface TopbarProps {
    name: string;
    avatar?: string | null;
    onNavigate: (page: string) => void;
}

function useClock() {
    const [now, setNow] = useState(new Date());
    useState(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    });
    return now;
}

export function Topbar({ name, avatar, onNavigate }: TopbarProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const now = useClock();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const hari = now.toLocaleDateString("id-ID", { weekday: "long" });
    const tanggal = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const jam = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="px-6 py-4 flex items-center gap-4">

                {/* Hari, Tanggal, Jam */}
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-md font-semibold text-gray-800">{hari}, {tanggal}</p>
                        <p className="text-sm text-gray-400 font-mono">{jam}</p>
                    </div>
                </div>

                {/* Avatar + Nama */}
                <div className="relative ml-auto flex-shrink-0">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        {avatar ? (
                            <img
                                src={avatar}
                                alt="Avatar"
                                className="w-9 h-9 rounded-full object-cover border border-gray-300"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center bg-gray-100">
                                <User className="w-5 h-5 text-gray-500" />
                            </div>
                        )}
                        <span className="text-sm font-medium text-gray-700">{name}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {showProfileMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <button
                                    onClick={() => { setShowProfileMenu(false); onNavigate('pengaturan'); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                                >
                                    <Settings className="w-4 h-4" />
                                    Pengaturan
                                </button>
                                <button
                                    onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-red-600 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}