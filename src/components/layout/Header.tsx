import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Menu, 
  X, 
  Wrench, 
  ShieldCheck, 
  Lock, 
  Compass
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { currentRoute, navigateTo, settings, openPartIdentifier } = useSite();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo({ name: 'products', search: searchQuery.trim() });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', route: { name: 'home' } as const },
    { label: 'Products Catalogue', route: { name: 'products' } as const },
    { label: 'Categories', route: { name: 'categories' } as const },
    { label: 'Our Stores', route: { name: 'stores' } as const },
    { label: 'About Us', route: { name: 'about' } as const },
    { label: 'Contact', route: { name: 'contact' } as const },
  ];

  const isActive = (route: { name: string }) => currentRoute.name === route.name;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white">
      {/* Top emergency & physical store notification ribbon */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium text-[11px] uppercase tracking-wider border border-amber-500/30">
              <ShieldCheck className="w-3 h-3" />
              Catalogue & Physical Stores Only
            </span>
            <span className="hidden sm:inline text-slate-400">
              Genuine Spare Parts for AC, Washing Machine, Microwave, RO & Fridge
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => openPartIdentifier()}
              className="text-amber-400 hover:text-amber-300 transition-colors font-medium flex items-center gap-1 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Need Part Identification?</span>
            </button>
            <span className="text-slate-700 hidden md:inline">|</span>
            <a 
              href={`tel:${settings?.phone || '+917760131002'}`}
              className="flex items-center gap-1.5 hover:text-white text-slate-300 transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>{settings?.phone || '+91 77601 31002'}</span>
            </a>
            {isAuthenticated ? (
              <button
                onClick={() => navigateTo({ name: 'admin', subview: 'dashboard' })}
                className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Lock className="w-3 h-3" />
                Admin Panel
              </button>
            ) : (
              <button
                onClick={() => navigateTo({ name: 'admin-login' })}
                className="text-slate-400 hover:text-slate-200 transition-colors text-[11px] flex items-center gap-1"
                title="Administrator Sign-in"
              >
                <Lock className="w-2.5 h-2.5" />
                Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div 
            onClick={() => navigateTo({ name: 'home' })}
            className="flex items-center gap-3 cursor-pointer select-none group"
            id="brand-logo-button"
          >
            <div className="w-11 h-11 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-2xl tracking-tighter shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
                  APEX
                </span>
                <span className="font-light text-xl sm:text-2xl tracking-widest text-amber-400">
                  ENTERPRISES
                </span>
              </div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                Appliance Spare Parts Specialist
              </p>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search part name, code (e.g. WM-PUMP-001), model..."
                className="w-full bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-400 rounded-lg pl-10 pr-20 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <button
                type="submit"
                id="header-search-submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Direct CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              id="header-find-store-btn"
              onClick={() => navigateTo({ name: 'stores' })}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Find Our Stores</span>
            </button>

            <button
              id="header-explore-catalogue-btn"
              onClick={() => navigateTo({ name: 'products' })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Catalogue</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 border-t border-slate-800/80 py-2.5 text-sm">
          {navLinks.map((link) => {
            const active = isActive(link.route);
            return (
              <button
                key={link.label}
                id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => navigateTo(link.route)}
                className={`px-3.5 py-1.5 rounded-md font-medium text-xs sm:text-sm tracking-wide transition-colors ${
                  active 
                    ? 'bg-amber-500 text-slate-950 font-bold' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spare parts catalogue..."
              className="w-full bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 rounded-lg pl-10 pr-20 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-amber-500 text-slate-950 font-bold text-xs rounded"
            >
              Go
            </button>
          </form>

          {/* Links */}
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  navigateTo(link.route);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.route)
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                navigateTo({ name: 'stores' });
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              Find Our Physical Stores
            </button>
            <button
              onClick={() => {
                openPartIdentifier();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              Spare Part Identification Assistance
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
