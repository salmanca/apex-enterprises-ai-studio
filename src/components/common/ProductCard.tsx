import React from 'react';
import { ChevronRight, CheckCircle2, AlertCircle, Clock, XCircle, Tag, Layers } from 'lucide-react';
import { Product } from '../../types';
import { useSite } from '../../context/SiteContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigateTo } = useSite();

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0] || {
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    altText: product.name
  };

  const getAvailabilityBadge = () => {
    switch (product.availability) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            In-Stock at Stores
          </span>
        );
      case 'Contact Store':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300/60">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            Contact Store
          </span>
        );
      case 'Check Availability':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300/60">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
            Check Availability
          </span>
        );
      case 'Currently Unavailable':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Special Order Only
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group bg-white rounded-xl border border-slate-200 hover:border-amber-400/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Product Image Area */}
      <div 
        onClick={() => navigateTo({ name: 'product-detail', slug: product.slug || product.id })}
        className="relative h-48 bg-slate-100 cursor-pointer overflow-hidden flex items-center justify-center p-3"
      >
        <img
          src={primaryImage.imageUrl}
          alt={primaryImage.altText || product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
          {product.sku && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono tracking-tight font-medium">
              <Tag className="w-3 h-3 text-amber-400" />
              {product.sku}
            </span>
          )}

          <div className="ml-auto">
            {getAvailabilityBadge()}
          </div>
        </div>

        {/* Category tag bottom pill */}
        <div className="absolute bottom-2 left-2.5 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 text-[11px] font-semibold border border-slate-200 shadow-xs">
            <Layers className="w-3 h-3 text-amber-600" />
            {product.categoryName || product.applianceType}
          </span>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Appliance */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>{product.brandName || 'Apex Certified'}</span>
            <span>{product.applianceType}</span>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => navigateTo({ name: 'product-detail', slug: product.slug || product.id })}
            className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-amber-600 transition-colors line-clamp-2 cursor-pointer mb-2"
          >
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
            {product.description}
          </p>

          {/* Compatibility snippet */}
          {product.compatibility && product.compatibility.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-2 mb-4 border border-slate-100 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800 block mb-0.5">Compatible with:</span>
              <p className="line-clamp-1 italic text-slate-500">
                {product.compatibility.slice(0, 2).join(', ')}
                {product.compatibility.length > 2 ? ` +${product.compatibility.length - 2} more` : ''}
              </p>
            </div>
          )}
        </div>

        {/* Action Button - STRICTLY "View Details", NEVER Buy Now or Add to Cart */}
        <div className="pt-2 border-t border-slate-100 mt-auto">
          <button
            id={`view-details-btn-${product.id}`}
            onClick={() => navigateTo({ name: 'product-detail', slug: product.slug || product.id })}
            className="w-full py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Details & In-Store Availability</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
