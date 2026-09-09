import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, PageRoute } from '../types';
import { api } from '../api/client';

interface SiteContextType {
  settings: SiteSettings | null;
  currentRoute: PageRoute;
  navigateTo: (route: PageRoute) => void;
  isPartIdentifierOpen: boolean;
  openPartIdentifier: (initialAppliance?: string) => void;
  closePartIdentifier: () => void;
  partIdentifierAppliance: string;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  id: 'apex-site-settings',
  businessName: 'Apex Enterprises',
  tagline: 'Your Trusted Appliance Spare Parts Partner',
  logo: '',
  phone: '+91 98201 54321',
  whatsapp: '+919820154321',
  email: 'info@apexenterprises.com',
  headquartersAddress: 'Metro Trade Arcade, Central Industrial & Electronics Market, Mumbai',
  homepageHeadline: 'Apex Enterprises',
  homepageSubheadline: 'Appliance Spare Parts for ACs, Washing Machines, Microwaves, Water Purifiers & Refrigerators',
  homepageSupportingText: 'Explore our spare parts catalogue and visit our nearest physical store.',
  aboutText: 'Apex Enterprises is a dedicated supplier of certified appliance spare parts for technicians and homeowners.',
  yearsOfExperience: '15+',
  disclaimer: 'This website is a product catalogue only. Physical stores handle retail and technician trade purchases.',
  socialLinks: {},
  callToActionPhone: '+91 98201 54321',
  callToActionWhatsapp: '+919820154321',
  updatedAt: new Date().toISOString()
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [currentRoute, setCurrentRoute] = useState<PageRoute>({ name: 'home' });
  const [isPartIdentifierOpen, setIsPartIdentifierOpen] = useState(false);
  const [partIdentifierAppliance, setPartIdentifierAppliance] = useState('');

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch {
      // keep fallback
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const navigateTo = (route: PageRoute) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPartIdentifier = (initialAppliance?: string) => {
    setPartIdentifierAppliance(initialAppliance || '');
    setIsPartIdentifierOpen(true);
  };

  const closePartIdentifier = () => {
    setIsPartIdentifierOpen(false);
    setPartIdentifierAppliance('');
  };

  return (
    <SiteContext.Provider value={{
      settings,
      currentRoute,
      navigateTo,
      isPartIdentifierOpen,
      openPartIdentifier,
      closePartIdentifier,
      partIdentifierAppliance,
      refreshSettings
    }}>
      {children}
    </SiteContext.Provider>
  );
};

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within a SiteProvider');
  return ctx;
}
