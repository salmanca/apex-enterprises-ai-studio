export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  brandId: string;
  applianceType: string;
  description: string;
  specifications: Record<string, string>;
  compatibility: string[];
  availability: 'Available' | 'Contact Store' | 'Check Availability' | 'Currently Unavailable';
  isActive: boolean;
  images: ProductImage[];
  brandName?: string;
  categoryName?: string;
  relatedProducts?: Product[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  applianceType: string;
  sortOrder: number;
  isActive: boolean;
  commonParts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  appliancesSupported?: string[];
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  name: string;
  storeCode: string;
  address: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp: string;
  email: string;
  googleMapsUrl: string;
  openingHours: string;
  weeklyClosedDay: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  id: string;
  businessName: string;
  tagline: string;
  logo: string;
  phone: string;
  whatsapp: string;
  email: string;
  headquartersAddress: string;
  homepageHeadline: string;
  homepageSubheadline: string;
  homepageSupportingText: string;
  aboutText: string;
  yearsOfExperience: string;
  disclaimer: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  callToActionPhone: string;
  callToActionWhatsapp: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalStores: number;
  activeStores: number;
  recentProducts: Product[];
  analyticsSummary: {
    totalEvents: number;
    breakdown: Record<string, number>;
    recent: Array<{ id: string; type: string; details?: any; timestamp: string }>;
  };
}

export type PageRoute = 
  | { name: 'home' }
  | { name: 'products'; category?: string; brand?: string; appliance?: string; search?: string }
  | { name: 'product-detail'; slug: string }
  | { name: 'categories' }
  | { name: 'stores'; storeId?: string }
  | { name: 'about' }
  | { name: 'contact' }
  | { name: 'policy' }
  | { name: 'admin-login' }
  | { name: 'admin'; subview?: 'dashboard' | 'products' | 'categories' | 'brands' | 'stores' | 'content' | 'security' };
