import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { LogIn, LogOut, Menu, Settings, ShoppingCart, User, X } from "lucide-react";

import simpa from "../../../assets/simpa-navbar.png";
import simpaPutih from "../../../assets/simpa-navbar-putih.png";
import { getMe } from "../../../services/userService";
import { getCartCount } from "../../../services/cartService";

type User = {
  nama: string;
  role: string;
  avatar?: string | null;
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState<User | null>(() => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    !!localStorage.getItem("token")
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<{ foto: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleUserUpdated = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setAvatar({ foto: user.foto ?? "" });
    };

    window.addEventListener("userUpdated", handleUserUpdated);
    return () => window.removeEventListener("userUpdated", handleUserUpdated);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMe();
        setAvatar({ foto: data.foto ?? "" });
      } catch {
        setAvatar(null);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      const data = localStorage.getItem("user");
      setUser(data ? JSON.parse(data) : null);
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateCount = async () => {
      if (!isLoggedIn) {
        setCartCount(0);
        return;
      }
      const count = await getCartCount();
      setCartCount(count);
    };

    updateCount();
  }, [isLoggedIn]);

  useEffect(() => {
    const handleCartUpdated = () => {
      getCartCount().then(setCartCount);
    };

    window.addEventListener("cartUpdated", handleCartUpdated);
    return () => window.removeEventListener("cartUpdated", handleCartUpdated);
  }, []);

  const navLinks = [
    { name: "Beranda", path: "/home" },
    { name: "Peralatan", path: "/list-peralatan" },
    { name: "Cara Peminjaman", path: "/cara-peminjaman" },
    { name: "Tentang Kami", path: "/tentang-kami" },
    ...(isLoggedIn ? [{ name: "Peminjaman", path: "/list-peminjaman" }] : []),
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsDropdownOpen(false);
    setCartCount(0);
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={`fixed top-18 left-1/2 -translate-x-1/2 z-50
  w-[92%] max-w-5xl
  transition-all duration-300
  rounded-full
  ${isScrolled
          ? "bg-lime-800 backdrop-blur-md shadow-lg"
          : "bg-lime-400 backdrop-blur-md"
        }`}
    >
      <div className="px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <img
            src={isScrolled ? simpaPutih : simpa}
            alt="EquipBorrow Logo"
            className="w-30 h-30"
          />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  relative text-md font-normal text-gray-900
                  after:content-['']
                  after:absolute after:-bottom-2 after:left-0
                  after:h-[2px] after:w-1/2 after:rounded-full
                  after:scale-x-0 after:opacity-0 after:origin-left
                  after:transition-all after:duration-300 after:ease-out
                  hover:after:scale-x-100 hover:after:opacity-100
                  ${isActive(link.path) ? "after:scale-x-100 after:opacity-100" : ""}
                  ${isScrolled ? "text-white after:bg-white" : "text-gray-900 after:bg-gray-900"}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart Icon */}
            {isLoggedIn && (
              <Link
                to="/keranjang"
                className={`relative p-2 rounded-lg transition ${isScrolled
                  ? "text-white hover:bg-white/10"
                  : "text-gray-900 hover:bg-black/5"
                  }`}
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full min-w-[18px] text-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth */}
            {!isLoggedIn ? (
              <Link to="/login">
                <button
                  className={`flex items-center gap-2 px-6 py-2.5 font-medium rounded-xl transition-all cursor-pointer ${isScrolled
                    ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                >
                  <LogIn size={18} />
                  Login
                </button>
              </Link>
            ) : (
              user && (
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="cursor-pointer"
                  >
                    {avatar?.foto ? (
                      <img
                        src={avatar.foto}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-gray-100">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings size={16} />
                        Setting
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors px-2 py-1 ${isActive(link.path)
                    ? "text-gray-900 bg-lime-50 rounded-lg"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {link.name}
                </Link>
              ))}

              {isLoggedIn && (
                <Link
                  to="/keranjang"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium px-2 py-1 text-gray-600 hover:text-gray-900"
                >
                  <ShoppingCart size={16} />
                  Keranjang
                  {cartCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {isLoggedIn && user && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-3 px-2 mb-3">
                    <Avatar user={user} />
                    <span className="text-sm font-medium">{user.nama}</span>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-2 py-2 text-sm hover:bg-gray-100 rounded-lg"
                  >
                    <Settings size={16} />
                    Setting
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function Avatar({ user }: { user: User }) {
  const initial = user.nama.charAt(0).toUpperCase();

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.nama}
        className="w-10 h-10 rounded-full object-cover cursor-pointer"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-lime-600 text-white flex items-center justify-center font-semibold cursor-pointer">
      {initial}
    </div>
  );
}