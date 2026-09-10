import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, Phone, Clock, MapPin, ExternalLink } from 'lucide-react';
import { Store } from '../../types';

interface StoreMapProps {
  stores: Store[];
  selectedStoreId?: string;
  onSelectStore?: (store: Store) => void;
  height?: string;
}

export const StoreMap: React.FC<StoreMapProps> = ({ 
  stores, 
  selectedStoreId, 
  onSelectStore, 
  height = '480px' 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [activePopupStore, setActivePopupStore] = useState<Store | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Bangalore center or average of stores
      const defaultLat = stores.length > 0 ? stores[0].latitude : 12.978975560275915;
      const defaultLng = stores.length > 0 ? stores[0].longitude : 77.63321432490876;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 11,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((m: L.Marker) => m.remove());
    markersRef.current = {};

    // Create custom technical industrial icon
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background: #f59e0b;
          color: #020617;
          border: 3px solid #0f172a;
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          cursor: pointer;
        ">
          A
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -17]
    });

    const bounds = L.latLngBounds([]);

    stores.forEach(store => {
      if (store.latitude && store.longitude) {
        const marker = L.marker([store.latitude, store.longitude], { icon: customIcon }).addTo(map);
        
        marker.on('click', () => {
          setActivePopupStore(store);
          if (onSelectStore) {
            onSelectStore(store);
          }
        });

        markersRef.current[store.id] = marker;
        bounds.extend([store.latitude, store.longitude]);
      }
    });

    if (stores.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    return () => {
      // clean up on unmount if needed
    };
  }, [stores]);

  // Handle selectedStoreId changes to pan and open popup
  useEffect(() => {
    if (selectedStoreId && mapInstanceRef.current && markersRef.current[selectedStoreId]) {
      const store = stores.find(s => s.id === selectedStoreId);
      if (store) {
        mapInstanceRef.current.setView([store.latitude, store.longitude], 15, { animate: true });
        setActivePopupStore(store);
      }
    }
  }, [selectedStoreId, stores]);

  const handleGetDirections = (store: Store) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
          const destination = `${store.latitude},${store.longitude}`;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
          window.open(url, '_blank');
        },
        () => {
          // Fallback if permission denied or unavailable
          const destination = `${store.latitude},${store.longitude}`;
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`, '_blank');
        },
        { timeout: 5000 }
      );
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`, '_blank');
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-slate-100">
      <div 
        ref={mapContainerRef} 
        id="apex-interactive-stores-map"
        style={{ height, width: '100%' }} 
        className="z-0"
      />

      {/* Embedded Store Details Floating Card on Marker Click */}
      {activePopupStore && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-10 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-slate-200 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {activePopupStore.storeCode}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">
                {activePopupStore.name}
              </h4>
            </div>
            <button
              onClick={() => setActivePopupStore(null)}
              className="text-slate-400 hover:text-slate-600 p-1 text-xs"
              aria-label="Close store popup"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-600 flex items-start gap-1.5 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>{activePopupStore.address}, {activePopupStore.area}, {activePopupStore.city}</span>
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{activePopupStore.openingHours}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
              <a href={`tel:${activePopupStore.phone}`} className="hover:underline font-medium text-slate-800">
                {activePopupStore.phone}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`popup-get-directions-${activePopupStore.id}`}
              onClick={() => handleGetDirections(activePopupStore)}
              className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </button>

            <a
              href={activePopupStore.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors"
              title="Open Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Maps</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
