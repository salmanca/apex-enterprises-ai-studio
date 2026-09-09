import React from 'react';
import { ShieldAlert, CheckCircle2, Building2, AlertTriangle } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export const PolicyView: React.FC = () => {
  const { navigateTo } = useSite();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-2">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          Business Terms & Legal Disclaimer
        </span>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Catalogue Policies & Walk-in Guidelines
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>1. Product Catalogue Notice (Non-E-Commerce Website)</span>
          </h2>
          <p>
            The website <strong>Apex Enterprises</strong> operates strictly as an online technical product catalogue, inventory guide, and store locator. This website <strong>does not conduct online financial transactions</strong>, accept credit/debit cards, process digital orders, or provide remote postal shipping through automated shopping carts.
          </p>
          <p>
            All commercial purchases, invoice generation, physical component inspections, and payments must be completed in-person at authorized Apex Enterprises physical walk-in store locations or through established technician trade accounts.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>2. Walk-in Counter Testing & Component Inspection</span>
          </h2>
          <p>
            To prevent customer inconvenience and ensure appliance compatibility, Apex Enterprises provides live component testing benches at our physical stores. Customers and repair technicians are actively encouraged to bring their faulty part sample to test against new inventory before finalizing any purchase.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            <span>3. In-Store Stock Availability</span>
          </h2>
          <p>
            While stock statuses are continually updated across our branches, rapid counter turnover may occasionally affect real-time stock levels. We recommend contacting our store phone or WhatsApp counter to place an immediate reserve hold on high-demand components (such as Inverter PCBs or rare compressor relays) prior to travelling.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-slate-600" />
            <span>4. Trademark & Compatibility Disclaimer</span>
          </h2>
          <p>
            All brand names, logos, model designations, and trademarks mentioned on this website (including but not limited to LG, Samsung, Daikin, Whirlpool, Voltas, Hitachi, Panasonic, Godrej, Kent, Aquaguard) are the registered property of their respective owners. Their mention on this website is solely for the technical purpose of identifying component compatibility and helping consumers and technicians find appropriate replacement parts.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => navigateTo({ name: 'stores' })}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            Locate Nearest Physical Store →
          </button>
        </div>
      </div>
    </div>
  );
};
