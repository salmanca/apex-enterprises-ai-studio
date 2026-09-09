import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Wrench, 
  RotateCcw, 
  SlidersHorizontal, 
  Check, 
  HelpCircle,
  Tag
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { api } from '../api/client';
import { Product, Category, Brand } from '../types';
import { ProductCard } from '../components/common/ProductCard';

interface ProductsViewProps {
  initialCategory?: string;
  initialBrand?: string;
  initialAppliance?: string;
  initialSearch?: string;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  initialCategory,
  initialBrand,
  initialAppliance,
  initialSearch
}) => {
  const { openPartIdentifier } = useSite();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [selectedBrand, setSelectedBrand] = useState(initialBrand || '');
  const [selectedAppliance, setSelectedAppliance] = useState(initialAppliance || '');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name-asc' | 'name-desc'>('newest');

  // Mobile filters drawer toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Load Categories and Brands
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, brs] = await Promise.all([
          api.getCategories(),
          api.getBrands()
        ]);
        setCategories(cats);
        setBrands(brs);
      } catch (err) {
        console.error('Error loading filters metadata', err);
      }
    }
    loadMeta();
  }, []);

  // Sync initial props
  useEffect(() => {
    if (initialSearch !== undefined) setSearch(initialSearch);
    if (initialCategory !== undefined) setSelectedCategory(initialCategory);
    if (initialBrand !== undefined) setSelectedBrand(initialBrand);
    if (initialAppliance !== undefined) setSelectedAppliance(initialAppliance);
  }, [initialSearch, initialCategory, initialBrand, initialAppliance]);

  // Load products based on current filters
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const data = await api.getProducts({
          category: selectedCategory || undefined,
          brand: selectedBrand || undefined,
          appliance: selectedAppliance || undefined,
          search: search || undefined,
          availability: selectedAvailability !== 'all' ? selectedAvailability : undefined
        });

        // Client-side sorting
        const sorted = [...data].sort((a, b) => {
          if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
          if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setProducts(sorted);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchProducts();
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedCategory, selectedBrand, selectedAppliance, search, selectedAvailability, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedAppliance('');
    setSelectedAvailability('all');
    setSortBy('newest');
  };

  const appliancesList = [
    'Air Conditioner',
    'Washing Machine',
    'Microwave Oven',
    'Water Purifier',
    'Refrigerator'
  ];

  const hasActiveFilters = Boolean(
    search || selectedCategory || selectedBrand || selectedAppliance || selectedAvailability !== 'all'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              In-Store Inventory
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              Appliance Spare Parts Catalogue
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl">
              Browse genuine replacement components, check exact specifications, and verify walk-in stock at our physical stores.
            </p>
          </div>

          <button
            onClick={() => openPartIdentifier()}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>Identify Hard-To-Find Part</span>
          </button>
        </div>
      </div>

      {/* Main layout with sidebar filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <span>Filter Catalogue</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Appliance Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Appliance Type
            </label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedAppliance('')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedAppliance === '' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>All Appliances</span>
                {selectedAppliance === '' && <Check className="w-3.5 h-3.5" />}
              </button>
              {appliancesList.map((app) => (
                <button
                  key={app}
                  onClick={() => {
                    setSelectedAppliance(app);
                    setSelectedCategory('');
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedAppliance.toLowerCase() === app.toLowerCase()
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{app}</span>
                  {selectedAppliance.toLowerCase() === app.toLowerCase() && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Category Filter */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Categories
            </label>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedCategory === '' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>All Categories</span>
                {selectedCategory === '' && <Check className="w-3.5 h-3.5" />}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Manufacturer / Brand
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedBrand('')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedBrand === '' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>All Brands</span>
                {selectedBrand === '' && <Check className="w-3.5 h-3.5" />}
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrand(b.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedBrand === b.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{b.name}</span>
                  {selectedBrand === b.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              In-Store Availability
            </label>
            <div className="space-y-1">
              {[
                { label: 'All Statuses', val: 'all' },
                { label: 'Available (In-Stock)', val: 'Available' },
                { label: 'Contact Store', val: 'Contact Store' },
                { label: 'Check Availability', val: 'Check Availability' },
                { label: 'Special Order', val: 'Currently Unavailable' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setSelectedAvailability(opt.val)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedAvailability === opt.val
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedAvailability === opt.val && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Catalog Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Bar: Search input & sorting */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                id="catalogue-search-field"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by part name, SKU code (e.g. WM-PUMP-001), or appliance..."
                className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
            >
              <Filter className="w-4 h-4 text-amber-500" />
              <span>Filters {hasActiveFilters ? '(Active)' : ''}</span>
            </button>

            {/* Sort Select */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                <option value="newest">Newest Catalog Additions</option>
                <option value="name-asc">Product Name (A to Z)</option>
                <option value="name-desc">Product Name (Z to A)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Active Filters:</span>
              {search && (
                <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                  Search: "{search}"
                  <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedAppliance && (
                <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                  Appliance: {selectedAppliance}
                  <button onClick={() => setSelectedAppliance('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedCategory && (
                <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                  Category: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedBrand && (
                <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                  Brand: {brands.find(b => b.id === selectedBrand)?.name || selectedBrand}
                  <button onClick={() => setSelectedBrand('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedAvailability !== 'all' && (
                <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                  Status: {selectedAvailability}
                  <button onClick={() => setSelectedAvailability('all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-amber-700 hover:underline font-bold text-xs ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Products Grid or Empty Search State */}
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading spare parts catalogue...</p>
            </div>
          ) : products.length === 0 ? (
            /* Mandatory Empty Search State specified in Prompt */
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Can't find the spare part you're looking for?
              </h3>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Contact Apex Enterprises and our team can help identify the required part. We have over 12,000+ parts in physical store warehouses that may not yet be listed in the online catalogue.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => openPartIdentifier()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Ask Technical Counter to Identify Part</span>
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                >
                  Reset Search Filters
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs text-slate-500 font-medium mb-4 flex items-center justify-between">
                <span>Showing {products.length} spare part components</span>
                <span className="text-emerald-700 font-semibold">Physical Walk-in & In-Store Availability</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Appliance */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-700 block mb-2">Appliance</label>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedAppliance(''); setIsMobileFilterOpen(false); }}
                  className="w-full text-left text-xs py-1.5 px-2 rounded hover:bg-slate-100"
                >
                  All Appliances
                </button>
                {appliancesList.map(app => (
                  <button
                    key={app}
                    onClick={() => { setSelectedAppliance(app); setIsMobileFilterOpen(false); }}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded ${
                      selectedAppliance.toLowerCase() === app.toLowerCase() ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-100'
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="pt-4 border-t">
              <label className="text-xs font-bold uppercase text-slate-700 block mb-2">Brands</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                <button
                  onClick={() => { setSelectedBrand(''); setIsMobileFilterOpen(false); }}
                  className="w-full text-left text-xs py-1.5 px-2 rounded hover:bg-slate-100"
                >
                  All Brands
                </button>
                {brands.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setSelectedBrand(b.id); setIsMobileFilterOpen(false); }}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded ${
                      selectedBrand === b.id ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-100'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                handleResetFilters();
                setIsMobileFilterOpen(false);
              }}
              className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
