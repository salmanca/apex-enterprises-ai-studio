import React, { useState, useEffect } from 'react';
import { ArrowRight, Layers, CheckCircle2, Wrench, ShieldCheck } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { api } from '../api/client';
import { Category } from '../types';

export const CategoriesView: React.FC = () => {
  const { navigateTo, openPartIdentifier } = useSite();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl space-y-3">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          Component Classifications
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Appliance Spare Parts Categories
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Apex Enterprises specializes in 5 primary appliance spare part domains. All categories are physically stocked across our store warehouses for immediate walk-in counter sales.
        </p>
      </div>

      {/* Categories Detailed Cards */}
      <div className="space-y-8">
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            id={`category-detail-${cat.id}`}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 sm:p-8"
          >
            {/* Category Image */}
            <div className="lg:col-span-4 h-60 rounded-xl overflow-hidden bg-slate-100 relative group">
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs font-bold px-2.5 py-1 rounded">
                Category #{index + 1}
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  {cat.applianceType}
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {cat.name}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Common Parts Examples */}
              {cat.commonParts && cat.commonParts.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Key Components Handled & In-Stock:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                    {cat.commonParts.map((part, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{part}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigateTo({ name: 'products', category: cat.slug })}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Browse {cat.applianceType} Catalogue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => openPartIdentifier(cat.applianceType)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>Identify a {cat.applianceType} Part</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
