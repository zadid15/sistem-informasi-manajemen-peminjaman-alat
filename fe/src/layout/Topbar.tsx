import { useState } from 'react';
import { Search, Settings, LogOut, ChevronDown } from 'lucide-react';

interface TopbarProps {
    name: string;
    onNavigate: (page: string) => void;
}

export function Topbar({ name, onNavigate }: TopbarProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const currentUser = {
        name: name,
        avatar: 'https://i.pravatar.cc/150?img=3',
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="px-6 py-4 flex items-center justify-between gap-4">

                {/* Search */}
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari alat, peminjam, atau kategori..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Avatar + Nama */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <img
                            src={currentUser.avatar}
                            alt="Avatar"
                            className="w-9 h-9 rounded-full object-cover border border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            {currentUser.name}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>

                    {showProfileMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowProfileMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <button
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        onNavigate('settings');
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>

                                <button
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        localStorage.clear();
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
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
