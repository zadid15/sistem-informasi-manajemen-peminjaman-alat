import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { LogIn, Menu, X } from "lucide-react";

import simpa from "../../../assets/simpa-navbar.png";
import simpaPutih from "../../../assets/simpa-navbar-putih.png";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", path: "/home" },
    { name: "Peralatan", path: "/list-peralatan" },
    { name: "Cara Peminjaman", path: "/cara-peminjaman" },
    { name: "Tentang Kami", path: "/tentang-kami" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50
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

          {/* Login Button */}
          <div className="hidden md:block">
            <Link to="/login">
              <button
                className={`flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-900 font-medium rounded-xl transition-all ${isScrolled ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-100"}`}
              >
                <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                Login
              </button>
            </Link>
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
              <button className="mt-2 px-6 py-2.5 bg-lime-400 hover:bg-lime-500 text-gray-900 font-medium rounded-xl transition-all">
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
