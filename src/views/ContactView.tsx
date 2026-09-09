import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  Send 
} from 'lucide-react';
import { useSite } from '../context/SiteContext';

export const ContactView: React.FC = () => {
  const { settings, openPartIdentifier } = useSite();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    appliance: 'Washing Machine',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hello Apex Enterprises,\nContact Inquiry from ${formData.name} (${formData.phone}):\n` +
      `• Appliance: ${formData.appliance}\n` +
      `• Message: ${formData.message}`
    );
    const wa = (settings?.whatsapp || '919820154321').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${wa}?text=${text}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-3">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
          Customer Service & Technical Helplines
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Contact Apex Enterprises
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Need to confirm whether an appliance part is currently available before travelling to a branch? Contact our sales desk or send photos of your damaged sample.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Direct Helplines</h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Phone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Phone Support</span>
                  <a href={`tel:${settings?.phone || '+919820154321'}`} className="text-slate-900 hover:text-amber-600 font-semibold">
                    {settings?.phone || '+91 98201 54321'}
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mon - Sat: 9:30 AM to 8:30 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">WhatsApp Sample Verification</span>
                  <a 
                    href={`https://wa.me/${(settings?.whatsapp || '919820154321').replace(/[^0-9]/g, '')}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    {settings?.whatsapp || '+91 98201 54321'}
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">Send sample photos or appliance stickers</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Email Inquiries</span>
                  <a href={`mailto:${settings?.email || 'info@apexenterprises.com'}`} className="text-slate-900 hover:underline font-medium">
                    {settings?.email || 'info@apexenterprises.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Headquarters & Central Counter</span>
                  <p>{settings?.headquartersAddress || 'Metro Trade Arcade, Central Industrial & Electronics Market, Mumbai'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-700" />
              <span>Need Immediate Technician Identification?</span>
            </h4>
            <p className="leading-relaxed">
              If you don't know the exact technical name of your component, click below to open our interactive spare-part identification assistant.
            </p>
            <button
              onClick={() => openPartIdentifier()}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
            >
              Open Part Identifier
            </button>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Send an Inquiry to Our Trade Counter</h3>
          <p className="text-xs text-slate-500">
            Fill in the details and our counter staff will answer your questions promptly.
          </p>

          {submitted ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-base">Inquiry Prepared</h4>
              <p className="text-xs text-slate-600">
                Your message details have been passed to our WhatsApp support counter. You may also call us directly for urgent spare part requirements.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Appliance Category
                </label>
                <select
                  value={formData.appliance}
                  onChange={(e) => setFormData({ ...formData, appliance: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Air Conditioner">Air Conditioner (AC)</option>
                  <option value="Washing Machine">Washing Machine</option>
                  <option value="Microwave Oven">Microwave Oven</option>
                  <option value="Water Purifier">Water Purifier / RO</option>
                  <option value="Refrigerator">Refrigerator / Fridge</option>
                  <option value="General Inquiry">General / Trade Inquiries</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Message or Part Requirement Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what spare part you need, appliance brand/model, or question..."
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry to Apex Support Counter</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
