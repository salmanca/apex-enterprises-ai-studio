import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  Navigation, 
  ExternalLink, 
  Building2, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import { api } from '../api/client';
import { Store } from '../types';
import { StoreMap } from '../components/common/StoreMap';

interface StoresViewProps {
  initialStoreId?: string;
}

export const StoresView: React.FC<StoresViewProps> = ({ initialStoreId }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(initialStoreId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStores() {
      try {
        const data = await api.getStores();
        setStores(data);
        if (!selectedStoreId && data.length > 0) {
          setSelectedStoreId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching stores', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStores();
  }, []);

  const handleGetDirections = (store: Store) => {
    // Track public analytics event
    api.logEvent('directions_clicked', { storeId: store.id, storeName: store.name });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
          const destination = `${store.latitude},${store.longitude}`;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
          window.open(url, '_blank');
        },
        () => {
          // Fallback if browser permission is blocked or unavailable
          const destination = `${store.latitude},${store.longitude}`;
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`, '_blank');
        },
        { timeout: 6000 }
      );
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`, '_blank');
    }
  };

  const handlePhoneCall = (store: Store) => {
    api.logEvent('phone_clicked', { storeId: store.id, storeName: store.name });
  };

  const handleWhatsAppChat = (store: Store) => {
    api.logEvent('whatsapp_clicked', { storeId: store.id, storeName: store.name });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl space-y-3">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          Physical Network
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Our Physical Stores & Depots
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Apex Enterprises operates multiple fully-stocked physical branches. Customers and technicians can walk in for component matching, diagnostic bench testing, and instant counter collection.
        </p>
      </div>

      {/* Interactive Map Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <span>Interactive Branch Map</span>
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Click any pin on the map to inspect branch coordinates and get turn-by-turn directions
          </span>
        </div>

        <StoreMap
          stores={stores}
          selectedStoreId={selectedStoreId}
          onSelectStore={(st) => setSelectedStoreId(st.id)}
          height="460px"
        />
      </section>

      {/* Stores Directory Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Branch Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Direct phone lines, WhatsApp counters, and store opening times.
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading store directory...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => {
              const isSelected = selectedStoreId === store.id;
              return (
                <div
                  key={store.id}
                  id={`store-card-${store.id}`}
                  className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm flex flex-col justify-between overflow-hidden ${
                    isSelected ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Store Photo */}
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    <img
                      src={store.imageUrl}
                      alt={store.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/90 text-white font-mono text-xs px-2.5 py-1 rounded font-bold">
                      {store.storeCode}
                    </div>
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow">
                      Walk-in Ready
                    </div>
                  </div>

                  {/* Store Details */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                          {store.area}, {store.city}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                          {store.name}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-600 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{store.address}, {store.area}, {store.city} - {store.postalCode}</span>
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{store.openingHours}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Weekly Off: <strong className="text-slate-800">{store.weeklyClosedDay}</strong></span>
                        </div>
                      </div>

                      {store.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 pt-1">
                          {store.description}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          id={`store-get-directions-${store.id}`}
                          onClick={() => handleGetDirections(store)}
                          className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Get Directions</span>
                        </button>

                        <button
                          onClick={() => setSelectedStoreId(store.id)}
                          className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>View on Map</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href={`tel:${store.phone}`}
                          onClick={() => handlePhoneCall(store)}
                          className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors"
                        >
                          <Phone className="w-3 h-3 text-slate-600" />
                          <span className="truncate">Call Store</span>
                        </a>

                        <a
                          href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(store.name)},%20I%20am%20inquiring%20about%20spare%20parts%20stock`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleWhatsAppChat(store)}
                          className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-medium border border-emerald-200 flex items-center justify-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
