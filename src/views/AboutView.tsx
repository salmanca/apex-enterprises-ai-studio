import React from 'react';
import { ShieldCheck, Award, Wrench, Users, CheckCircle2, Building2, Phone, MapPin } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export const AboutView: React.FC = () => {
  const { navigateTo, settings, openPartIdentifier } = useSite();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-4">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          Since 2009 • 15+ Years of Service
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          About Apex Enterprises
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
          {settings?.aboutText || 'Apex Enterprises is an established, physical spare-parts business specializing in genuine appliance spare parts for Air Conditioners, Washing Machines, Microwaves, Water Purifiers, and Refrigerators.'}
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">100% Genuine Components</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We strictly reject counterfeit and low-grade copies. Every batch of motors, PCBs, sensors, and capacitors undergoes physical bench testing.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Sample Matching Counters</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unsure of the part number? Technicians and customers can bring burned, broken, or unlabelled sample parts directly to our physical sales counters.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Physical Store Network</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We are not a virtual drop-shipping facade. We operate real, inventory-backed physical stores where you inspect the exact part before paying.
          </p>
        </div>
      </div>

      {/* Who We Serve */}
      <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
            Our Customers & Trade Partners
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Who Relies on Apex Enterprises?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">HVAC & AC Technicians</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inverter PCBs, copper fittings, dual capacitors, cross-flow blower wheels, and DC fan motors.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Appliance Repair Workshops</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Washing machine drain pumps, pulsators, suspension springs, door latches, and electronic timer boards.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">RO Service Providers</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-TDS membranes, booster pumps, heavy SMPS power supplies, solenoid valves, and food-grade housings.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Homeowners & DIY Fixers</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Friendly counter assistance for replacing refrigerator door seals, microwave turntable rollers, or lint filters.
            </p>
          </div>
        </div>
      </div>

      {/* Walk-in Call to Action */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white">Have questions regarding part availability?</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visit any Apex Enterprises store or reach out to our central inquiry desk.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigateTo({ name: 'stores' })}
            className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-amber-400 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span>Store Coordinates</span>
          </button>
          <button
            onClick={() => openPartIdentifier()}
            className="px-5 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Part Identification</span>
          </button>
        </div>
      </div>
    </div>
  );
};
