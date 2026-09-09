import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Building2, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { api } from '../api/client';
import { Product, Category, Store } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { StoreMap } from '../components/common/StoreMap';

export const HomeView: React.FC = () => {
  const { navigateTo, settings, openPartIdentifier } = useSite();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [cats, prods, sts] = await Promise.all([
          api.getCategories(),
          api.getProducts({ featured: true }),
          api.getStores()
        ]);
        setCategories(cats);
        setFeaturedProducts(prods.slice(0, 6));
        setStores(sts);
      } catch (err) {
        console.error('Error loading home data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo({ name: 'products', search: searchQuery.trim() });
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 lg:py-24 border-b border-slate-800">
        {/* Subtle industrial background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Physical Spare Parts Business • Genuine Stock</span>
              </div>

              {/* Exact required headline & subheadline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                {settings?.homepageHeadline || 'Apex Enterprises'}
              </h1>

              <p className="text-lg sm:text-xl font-medium text-amber-400 leading-snug">
                {settings?.homepageSubheadline || 'Appliance Spare Parts for ACs, Washing Machines, Microwaves, Water Purifiers & Refrigerators'}
              </p>

              {/* Exact supporting text */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                {settings?.homepageSupportingText || 'Explore our spare parts catalogue and visit our nearest physical store.'}
              </p>

              {/* Search in Hero */}
              <form onSubmit={handleHeroSearch} className="max-w-xl relative pt-2">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    id="hero-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search spare part (e.g., drain pump, magnetron, PCB)..."
                    className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl pl-12 pr-28 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    id="hero-search-btn"
                    className="absolute right-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Exact buttons mandated: "Explore Products" and "Find Our Stores" */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  id="hero-explore-products-btn"
                  onClick={() => navigateTo({ name: 'products' })}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer hover:translate-y-[-1px]"
                >
                  <Compass className="w-5 h-5" />
                  <span>Explore Products</span>
                </button>

                <button
                  id="hero-find-stores-btn"
                  onClick={() => navigateTo({ name: 'stores' })}
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 border border-slate-700 transition-colors cursor-pointer"
                >
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <span>Find Our Stores</span>
                </button>

                <button
                  onClick={() => openPartIdentifier()}
                  className="text-xs sm:text-sm text-slate-300 hover:text-amber-400 underline underline-offset-4 flex items-center gap-1.5 transition-colors cursor-pointer ml-1"
                >
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Can't find your part? Ask a Technician</span>
                </button>
              </div>

              {/* Assurance Bar */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>100% Genuine OEM & High-Grade Spares</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Ready Counter Testing Benches</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Physical Store Walk-in Assistance</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card (Business Profile & Direct Map Teaser) */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div>
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Physical Presence</span>
                    <h3 className="text-xl font-bold text-white">Central Hub & Warehouses</h3>
                  </div>
                  <Building2 className="w-8 h-8 text-amber-500" />
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">Main Flagship Counter</span>
                      <span>Metro Trade Arcade, Central Industrial & Electronics Market, Mumbai</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Mon – Sat: 9:30 AM – 8:30 PM</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">Open Today</span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-400" />
                      <span>Counter Helpline: {settings?.phone || '+91 98201 54321'}</span>
                    </div>
                    <a
                      href={`tel:${settings?.phone || '+919820154321'}`}
                      className="text-amber-400 hover:underline font-bold"
                    >
                      Call Now
                    </a>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Technician Notice:</strong> Bring your burned or damaged sample part directly to our sales counter for instant physical component matching.
                  </p>
                </div>

                <button
                  onClick={() => navigateTo({ name: 'stores' })}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>View All Store Addresses & GPS Directions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
              Component Inventory
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Appliance Spare Part Categories
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Select your appliance category to explore verified replacement parts, specifications, and in-store availability.
            </p>
          </div>

          <button
            onClick={() => navigateTo({ name: 'categories' })}
            className="text-xs font-bold text-slate-900 hover:text-amber-600 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <span>View All Categories Overview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              id={`home-cat-card-${cat.id}`}
              onClick={() => navigateTo({ name: 'products', category: cat.slug })}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-amber-400/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col"
            >
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-500 text-slate-950">
                    {cat.applianceType}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                {/* Common parts list tags */}
                {cat.commonParts && cat.commonParts.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                      Popular Spares in Stock:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.commonParts.slice(0, 4).map((p, idx) => (
                        <span key={idx} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {p}
                        </span>
                      ))}
                      {cat.commonParts.length > 4 && (
                        <span className="text-[11px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold">
                          +{cat.commonParts.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  <span>Browse {cat.applianceType} Spares</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS CATALOGUE PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
              Catalogue Highlights
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Genuine Spare Parts
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              View technical specifications and verify physical store stock before visiting.
            </p>
          </div>

          <button
            onClick={() => navigateTo({ name: 'products' })}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span>View All Spare Parts</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. HOW CUSTOMERS BUY FROM APEX ENTERPRISES (4-STEP WALK-IN JOURNEY) */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              Simple In-Store Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How to Procure Your Spare Part
            </h2>
            <p className="text-sm text-slate-600">
              No online checkout or shipping delays. We operate real physical stores with direct counter sales and diagnostic assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-slate-900 text-base">Browse Catalogue</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search by part name, SKU code, or appliance type to inspect photos, specifications, and compatibility.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-base">Identify / Inquire</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check model compatibility or WhatsApp our technical counter with your faulty sample photo for confirmation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-slate-900 text-base">Find Nearest Store</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Locate your closest Apex Enterprises branch and tap "Get Directions" for GPS navigation.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">
                4
              </span>
              <h3 className="font-bold text-slate-900 text-base">Physical Pickup</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Walk in, test the component on our bench if needed, and purchase directly at our trade or retail counter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MULTIPLE PHYSICAL STORES LOCATOR PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
              Physical Stores
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Visit an Apex Enterprises Store Near You
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Find our physical branches, check operating hours, or get turn-by-turn directions.
            </p>
          </div>

          <button
            onClick={() => navigateTo({ name: 'stores' })}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors self-start md:self-auto"
          >
            <MapPin className="w-4 h-4" />
            <span>Open Interactive Store Locator</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Map */}
          <div className="lg:col-span-7">
            <StoreMap stores={stores} height="420px" />
          </div>

          {/* Stores List Snapshot */}
          <div className="lg:col-span-5 space-y-4">
            {stores.map((store) => (
              <div 
                key={store.id} 
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-amber-400 transition-colors space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {store.storeCode}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{store.name}</h4>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                    Active Branch
                  </span>
                </div>

                <p className="text-xs text-slate-600 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{store.address}, {store.area}, {store.city} - {store.postalCode}</span>
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span className="truncate">{store.openingHours}</span>
                  <a href={`tel:${store.phone}`} className="text-slate-800 hover:text-amber-600 font-bold shrink-0">
                    {store.phone}
                  </a>
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          pos => {
                            window.open(`https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${store.latitude},${store.longitude}`, '_blank');
                          },
                          () => {
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`, '_blank');
                          }
                        );
                      } else {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`, '_blank');
                      }
                    }}
                    className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold text-xs rounded transition-colors"
                  >
                    Get Directions
                  </button>

                  <a
                    href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(store.name)},%20I%20am%20inquiring%20about%20spare%20parts%20stock`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded border border-emerald-200 transition-colors flex items-center justify-center"
                  >
                    WhatsApp Store
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PART IDENTIFICATION HELP BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white border border-slate-700 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs uppercase tracking-wider border border-amber-500/30">
              <HelpCircle className="w-3.5 h-3.5" />
              Hard-To-Find Appliance Parts
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Can't find the exact spare part you are looking for?
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Contact Apex Enterprises and our technical team can help identify the required part based on your appliance brand, model number, or a photo of the faulty component.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => openPartIdentifier()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Identify My Spare Part</span>
            </button>
            <a
              href={`tel:${settings?.phone || '+919820154321'}`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-600 transition-colors"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Speak to a Technician</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
