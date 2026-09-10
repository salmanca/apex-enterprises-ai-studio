import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Tag, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle, 
  ShieldCheck, 
  Wrench, 
  Share2, 
  Building2, 
  ExternalLink 
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { api } from '../api/client';
import { Product, Store } from '../types';
import { ProductCard } from '../components/common/ProductCard';

interface ProductDetailViewProps {
  slug: string;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ slug }) => {
  const { navigateTo, settings, openPartIdentifier } = useSite();
  const [product, setProduct] = useState<Product | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      setError(null);
      try {
        const [prod, sts] = await Promise.all([
          api.getProduct(slug),
          api.getStores()
        ]);
        setProduct(prod);
        setStores(sts);
        setActiveImageIdx(0);

        // Track public analytics event
        api.logEvent('product_viewed', { productId: prod.id, name: prod.name, sku: prod.sku });
      } catch (err: any) {
        setError(err.message || 'Product not found');
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Retrieving technical specifications and stock details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-600">
          This spare part may have been removed or is currently unavailable in the catalogue.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => navigateTo({ name: 'products' })}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Back to Catalogue
          </button>
          <button
            onClick={() => openPartIdentifier()}
            className="px-5 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
          >
            Help Me Identify Part
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [
    {
      id: 'default-img',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      altText: product.name,
      sortOrder: 1,
      isPrimary: true
    }
  ];

  const currentImage = images[activeImageIdx] || images[0];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAvailabilityBadge = () => {
    switch (product.availability) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            In-Stock at Physical Stores
          </span>
        );
      case 'Contact Store':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-4 h-4 text-amber-700" />
            Contact Nearest Store for Stock
          </span>
        );
      case 'Check Availability':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            Check Availability
          </span>
        );
      case 'Currently Unavailable':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <XCircle className="w-4 h-4 text-slate-500" />
            Special Order Only
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <button
          onClick={() => navigateTo({ name: 'products' })}
          className="flex items-center gap-1.5 text-slate-700 hover:text-amber-600 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Link Copied!' : 'Share Part Specs'}</span>
        </button>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center min-h-[380px] max-h-[480px] shadow-xs relative overflow-hidden">
            <img
              src={currentImage.imageUrl}
              alt={currentImage.altText || product.name}
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
            {product.sku && (
              <span className="absolute top-4 left-4 bg-slate-900/90 text-white font-mono text-xs px-2.5 py-1 rounded font-semibold">
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-xl bg-white border-2 p-1.5 shrink-0 overflow-hidden transition-all ${
                    activeImageIdx === idx ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.altText || `Thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Genuine Guarantee Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block">Apex Enterprises Physical Quality Assurance</span>
              <span>
                All spare parts are physically inspected at our central receiving depot. Bring your faulty part to our branch for free multi-meter and pinout verification.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Store Procurement CTA */}
        <div className="lg:col-span-6 space-y-6">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
              {product.applianceType}
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium">
              Brand: <strong>{product.brandName || 'Apex Certified'}</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium">
              Category: <strong>{product.categoryName}</strong>
            </span>
          </div>

          {/* Product Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {product.name}
          </h1>

          {/* Availability Badge */}
          <div>{getAvailabilityBadge()}</div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* MANDATORY PROCUREMENT CTA BOX (REPLACING ONLINE PURCHASING) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Physical Store Procurement
              </span>
              <h3 className="text-lg font-bold text-white">
                Need this part? Contact or visit our store.
              </h3>
              <p className="text-xs text-slate-300">
                To purchase this spare part, verify availability at your nearest Apex Enterprises store or contact our technical sales desk.
              </p>
            </div>

            {/* Direct Action Buttons: Call Us, WhatsApp Us, Find Nearest Store */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <a
                id="product-detail-call-btn"
                href={`tel:${settings?.callToActionPhone || settings?.phone || '+917760131002'}`}
                className="py-3 px-3 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
              >
                <Phone className="w-4 h-4 text-amber-600" />
                <span>Call Us</span>
              </a>

              <a
                id="product-detail-whatsapp-btn"
                href={`https://wa.me/${(settings?.callToActionWhatsapp || settings?.whatsapp || '917760131002').replace(/[^0-9]/g, '')}?text=Hello%20Apex%20Enterprises,%20I%20am%20inquiring%20about%20in-store%20availability%20for%20part:%20${encodeURIComponent(product.name)}%20(SKU:%20${encodeURIComponent(product.sku || 'N/A')})`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </a>

              <button
                id="product-detail-find-store-btn"
                onClick={() => navigateTo({ name: 'stores' })}
                className="py-3 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors text-center cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>Find Nearest Store</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-700/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Walk-in counters with instant component testing</span>
              <span className="font-semibold text-amber-400">Ready In-Stock</span>
            </div>
          </div>

          {/* Compatibility Information */}
          {product.compatibility && product.compatibility.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Compatible Appliance Models & Brands</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                {product.compatibility.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden space-y-0">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm">
                  Technical Specifications
                </h3>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-2 px-5 py-2.5">
                    <span className="font-semibold text-slate-700">{key}</span>
                    <span className="text-slate-600">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available Physical Store Branches Snapshot */}
      <section className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Stock Inquiries & Walk-in Pickups
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Available at Apex Enterprises Branches
            </h2>
            <p className="text-xs text-slate-500">
              Visit any of our authorized physical branches to inspect this spare part in person.
            </p>
          </div>

          <button
            onClick={() => navigateTo({ name: 'stores' })}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Open All Store Locations</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {store.storeCode}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{store.name}</h4>
              <p className="text-slate-500 line-clamp-2">{store.address}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-medium">{store.phone}</span>
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
                  className="text-amber-600 hover:underline font-bold"
                >
                  Directions →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">
              Related Spare Parts in this Category
            </h2>
            <p className="text-xs text-slate-500">
              Frequently paired components and alternate specifications for {product.applianceType}.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
