import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  ShieldAlert, 
  ArrowUpRight, 
  Lock,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';

export const Footer: React.FC = () => {
  const { navigateTo, settings } = useSite();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      {/* Non-ecommerce reassurance banner */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">
                Official Business Policy: In-Store Catalogue Only
              </p>
              <p className="text-slate-400">
                This website does not support online payments, shopping carts, or digital transactions. All purchases occur directly at our physical stores or verified trade counters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigateTo({ name: 'stores' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              View Store Coordinates
            </button>
            <a
              href={`https://wa.me/${(settings?.whatsapp || '917760131002').replace(/[^0-9]/g, '')}?text=Hello%20Apex%20Enterprises,%20I%20need%20assistance%20with%20a%20spare%20part`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 font-medium border border-emerald-500/30 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Helpdesk
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl">
                A
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                APEX <span className="font-light text-amber-400">ENTERPRISES</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Your trusted partner for genuine appliance spare parts. Serving repair technicians, service centers, and homeowners across Mumbai & Maharashtra with verified OEM components and physical walk-in stores.
            </p>

            <div className="flex flex-col space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>15,000+ In-Stock Spare Parts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Live Component Testing Counters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Physical Sample Matching for Hard-to-Find Spares</span>
              </div>
            </div>
          </div>

          {/* Categories Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Spare Part Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => navigateTo({ name: 'products', appliance: 'Air Conditioner' })}
                  className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>AC Spare Parts</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo({ name: 'products', appliance: 'Washing Machine' })}
                  className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>Washing Machine Spares</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo({ name: 'products', appliance: 'Microwave Oven' })}
                  className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>Microwave Oven Spares</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo({ name: 'products', appliance: 'Water Purifier' })}
                  className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>Water Purifier / RO Spares</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo({ name: 'products', appliance: 'Refrigerator' })}
                  className="hover:text-amber-400 transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>Refrigerator / Fridge Spares</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo({ name: 'home' })} className="hover:text-amber-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo({ name: 'products' })} className="hover:text-amber-400 transition-colors">
                  Browse Full Catalogue
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo({ name: 'categories' })} className="hover:text-amber-400 transition-colors">
                  Categories Overview
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo({ name: 'stores' })} className="hover:text-amber-400 transition-colors">
                  Physical Store Locations
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo({ name: 'about' })} className="hover:text-amber-400 transition-colors">
                  About Apex Enterprises
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo({ name: 'contact' })} className="hover:text-amber-400 transition-colors">
                  Contact & Branch Numbers
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo({ name: 'policy' })} className="hover:text-amber-400 transition-colors">
                  Privacy Policy & Disclaimer
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Central Contact
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings?.headquartersAddress || '#16, 17th F Cross, Indiranagar, Bangalore, 560038'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${settings?.phone || '+917760131002'}`} className="hover:text-white transition-colors">
                  {settings?.phone || '+91 77601 31002'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a 
                  href={`https://wa.me/${(settings?.whatsapp || '917760131002').replace(/[^0-9]/g, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: {settings?.whatsapp || '+91 77601 31002'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings?.email || 'info.apexbangalore@yahoo.com'}`} className="hover:text-white transition-colors">
                  {settings?.email || 'info.apexbangalore@yahoo.com'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Apex Enterprises. All rights reserved. Appliance Spare Parts Catalogue & Physical Store System.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo({ name: 'policy' })}
              className="hover:text-slate-300 transition-colors"
            >
              Catalogue Terms
            </button>
            <span>•</span>
            <button
              onClick={() => navigateTo({ name: 'admin-login' })}
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              Staff / Admin Sign-in
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
