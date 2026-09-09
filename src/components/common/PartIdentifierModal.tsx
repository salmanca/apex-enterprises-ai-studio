import React, { useState } from 'react';
import { Wrench, X, MessageSquare, Phone, CheckCircle2, FileQuestion } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

export const PartIdentifierModal: React.FC = () => {
  const { isPartIdentifierOpen, closePartIdentifier, partIdentifierAppliance, settings } = useSite();
  const [appliance, setAppliance] = useState(partIdentifierAppliance || 'Washing Machine');
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [partDescription, setPartDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isPartIdentifierOpen) return null;

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello Apex Enterprises,\nI need help identifying a spare part:\n` +
      `• Appliance: ${appliance}\n` +
      `• Brand: ${brand || 'Not specified'}\n` +
      `• Model No: ${modelNumber || 'Not specified'}\n` +
      `• Part Needed: ${partDescription || 'Looking for replacement part'}\n\n` +
      `Please let me know availability at your nearest store.`
    );
    const waNumber = (settings?.whatsapp || '919820154321').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Can't Find Your Spare Part?</h3>
              <p className="text-xs text-slate-300">Apex technical team will identify and verify store stock</p>
            </div>
          </div>
          <button
            onClick={closePartIdentifier}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">Inquiry Initiated</h4>
              <p className="text-sm text-slate-600">
                Your request details have been formatted for our technical counter. If you haven't opened WhatsApp, you can also call our central store helpline directly.
              </p>
              <div className="pt-3 flex justify-center gap-3">
                <a
                  href={`tel:${settings?.phone || '+919820154321'}`}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  Call Store: {settings?.phone || '+91 98201 54321'}
                </a>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    closePartIdentifier();
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
                <FileQuestion className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Tip: Have your appliance model sticker or old sample part photo ready. You can send it directly to our store technicians on WhatsApp for 100% accurate match!
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Appliance Type *
                </label>
                <select
                  value={appliance}
                  onChange={(e) => setAppliance(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="Air Conditioner">Air Conditioner (AC)</option>
                  <option value="Washing Machine">Washing Machine</option>
                  <option value="Microwave Oven">Microwave Oven</option>
                  <option value="Water Purifier">Water Purifier / RO</option>
                  <option value="Refrigerator">Refrigerator / Fridge</option>
                  <option value="Other Appliance">Other Commercial / Domestic Appliance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. LG, Samsung, Daikin"
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Model Number
                  </label>
                  <input
                    type="text"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    placeholder="e.g. FHM1207SDW"
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Describe Spare Part or Fault *
                </label>
                <textarea
                  rows={3}
                  value={partDescription}
                  onChange={(e) => setPartDescription(e.target.value)}
                  placeholder="e.g., Drain pump not discharging water, or need outdoor fan motor capacitor 45+5 MFD..."
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleWhatsAppInquiry}
                  className="flex-1 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send to Technician on WhatsApp</span>
                </button>
                <a
                  href={`tel:${settings?.phone || '+919820154321'}`}
                  className="py-3 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Call Us</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
