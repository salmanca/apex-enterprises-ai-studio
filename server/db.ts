import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
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
  relatedProductIds?: string[];
  featured?: boolean;
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

export interface AnalyticsEvent {
  id: string;
  type: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface DatabaseSchema {
  adminUsers: AdminUser[];
  categories: Category[];
  brands: Brand[];
  products: Product[];
  stores: Store[];
  settings: SiteSettings;
  analytics: AnalyticsEvent[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function getInitialData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('admin123', salt);

  const initialCategories: Category[] = [
    {
      id: 'cat-ac',
      name: 'Air Conditioner (AC) Spare Parts',
      slug: 'ac-spare-parts',
      applianceType: 'Air Conditioner',
      description: 'Original and certified replacement components for Split, Window, and Inverter AC systems including PCBs, fan motors, sensors, and remote controllers.',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
      sortOrder: 1,
      isActive: true,
      commonParts: ['AC PCB & Inverter Boards', 'Indoor / Outdoor Fan Motors', 'Dual Run Capacitors', 'Room & Coil Temperature Sensors', 'Magnetic Relays & Contactors', '4-Way Reversing Valves', 'Universal & OEM Remote Controls', 'Electronic Expansion Valves'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-wm',
      name: 'Washing Machine Spare Parts',
      slug: 'washing-machine-spare-parts',
      applianceType: 'Washing Machine',
      description: 'Heavy-duty replacement parts for Front Load, Top Load, and Semi-Automatic washing machines across top global manufacturers.',
      imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80',
      sortOrder: 2,
      isActive: true,
      commonParts: ['Drain Pumps & Filter Assemblies', 'Single / Double Inlet Solenoid Valves', 'Drive Motors & Pulsator Shafts', 'Digital Control PCBs', 'Thermal & Magnetic Door Locks', 'Molded Rubber Door Bellows', 'Tub Bearings & Oil Seals', 'Electronic Pressure Sensors', 'Suspension Damper Rods', 'Mechanical Wash Timers'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-mw',
      name: 'Microwave Oven Spare Parts',
      slug: 'microwave-spare-parts',
      applianceType: 'Microwave Oven',
      description: 'Genuine high-voltage and low-voltage microwave spares for solo, grill, and convection oven repairs.',
      imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&auto=format&fit=crop&q=80',
      sortOrder: 3,
      isActive: true,
      commonParts: ['OEM Magnetrons', 'High Voltage Oil Capacitors', 'High Voltage Rectifier Diodes', 'Step-up HV Transformers', 'Convection & Blower Motors', 'Display & Touch PCBs', 'Micro Door Interlock Switches', 'Ceramic High Voltage Fuses', 'Synchronous Turntable Motors', 'Mica Waveguide Cover Sheets'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-ro',
      name: 'Water Purifier / RO Spare Parts',
      slug: 'water-purifier-ro-spare-parts',
      applianceType: 'Water Purifier',
      description: 'Commercial and residential RO system consumables, booster pumps, membrane filters, and electronic regulators.',
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
      sortOrder: 4,
      isActive: true,
      commonParts: ['75 & 100 GPD RO Membranes', 'Heavy-Duty 24V/36V Booster Pumps', 'SMPS Power Adapters', 'Solenoid Shutoff Valves', 'Pre-Carbon & Spun Poly Sediment Filters', 'Leak-proof Filter Housings', 'Philips/Osram UV Lamps', 'Flow Restrictors (FR 450/550)', 'Magnetic Float Switches', 'Quick Connect Push-fit Elbows & Tubing', 'Manual & Auto TDS Controllers'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-ref',
      name: 'Refrigerator / Fridge Spare Parts',
      slug: 'refrigerator-spare-parts',
      applianceType: 'Refrigerator',
      description: 'Precision cooling spares for single-door, double-door, frost-free, and side-by-side inverter refrigerators.',
      imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80',
      sortOrder: 5,
      isActive: true,
      commonParts: ['Inverter Compressor Control PCBs', 'DC Evaporator Fan Motors', 'Defrost Temperature Sensors & Bi-metals', 'Mechanical & Digital Thermostats', 'PTC Starter Relays', 'Overload Protectors (OLP)', 'Defrost Quartz Heaters', 'Electronic Defrost Timers', 'Motorized Air Damper Valves', 'Door Light Switches', 'Motor Run Capacitors'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const initialBrands: Brand[] = [
    { id: 'b-lg', name: 'LG', slug: 'lg', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'b-samsung', name: 'Samsung', slug: 'samsung', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'b-daikin', name: 'Daikin', slug: 'daikin', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'b-voltas', name: 'Voltas', slug: 'voltas', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'b-whirlpool', name: 'Whirlpool', slug: 'whirlpool', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'b-ifb', name: 'IFB', slug: 'ifb', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'b-bosch', name: 'Bosch', slug: 'bosch', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'b-panasonic', name: 'Panasonic', slug: 'panasonic', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'b-godrej', name: 'Godrej', slug: 'godrej', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'b-kent', name: 'Kent', slug: 'kent', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'b-aquaguard', name: 'Aquaguard / Eureka Forbes', slug: 'aquaguard', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'b-carrier', name: 'Carrier', slug: 'carrier', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];

  const initialStores: Store[] = [
    {
      id: 'store-central',
      name: 'Apex Enterprises — Main City Flagship Store',
      storeCode: 'APEX-01-MAIN',
      address: 'Shop No. 14-16, Metro Trade Arcade, Central Industrial & Electronics Market',
      area: 'Central Commercial Hub',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      latitude: 18.9402,
      longitude: 72.8354,
      phone: '+91 98201 54321',
      whatsapp: '+919820154321',
      email: 'central@apexenterprises.com',
      googleMapsUrl: 'https://maps.google.com/?q=18.9402,72.8354',
      openingHours: 'Monday – Saturday: 9:30 AM – 8:30 PM',
      weeklyClosedDay: 'Sunday',
      description: 'Our primary warehouse and sales counter stocking over 12,000+ ready spare parts for ACs, washing machines, RO systems, and refrigerators. Dedicated counter for certified repair technicians and retail customers.',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'store-north',
      name: 'Apex Enterprises — North Suburb Branch',
      storeCode: 'APEX-02-NORTH',
      address: 'Plot 42, Ground Floor, Sector 17 Spare Hub, Link Road',
      area: 'North Suburbs',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400053',
      latitude: 19.1363,
      longitude: 72.8277,
      phone: '+91 98202 65432',
      whatsapp: '+919820265432',
      email: 'northbranch@apexenterprises.com',
      googleMapsUrl: 'https://maps.google.com/?q=19.1363,72.8277',
      openingHours: 'Monday – Saturday: 9:00 AM – 8:00 PM',
      weeklyClosedDay: 'Sunday',
      description: 'Quick-access spare parts depot specializing in inverter AC circuit boards, washing machine drain pumps, and RO purifier filters with immediate walk-in counter service.',
      imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'store-east',
      name: 'Apex Enterprises — East Ring Distribution Depot',
      storeCode: 'APEX-03-EAST',
      address: 'Unit 8, Technicians Plaza, Near Old Toll Station, Highway Corridor',
      area: 'Eastern Expressway Zone',
      city: 'Thane',
      state: 'Maharashtra',
      postalCode: '400601',
      latitude: 19.2183,
      longitude: 72.9781,
      phone: '+91 98203 76543',
      whatsapp: '+919820376543',
      email: 'eastdepot@apexenterprises.com',
      googleMapsUrl: 'https://maps.google.com/?q=19.2183,72.9781',
      openingHours: 'Tuesday – Sunday: 10:00 AM – 8:30 PM',
      weeklyClosedDay: 'Monday',
      description: 'Spacious outlet with dedicated parts testing bench for PCB diagnostics and magnetron inspection. Free physical matching of customer sample parts.',
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const initialProducts: Product[] = [
    {
      id: 'prod-wm-pump-01',
      name: 'Universal Front Load & Top Load Washing Machine Drain Pump',
      slug: 'universal-washing-machine-drain-pump',
      sku: 'WM-PUMP-001',
      categoryId: 'cat-wm',
      brandId: 'b-lg',
      applianceType: 'Washing Machine',
      description: 'High-performance electromagnetic replacement drain pump with removable lint filter housing. Engineered for silent drainage, thermal overload protection, and maximum impeller durability.',
      specifications: {
        'Voltage': '220V - 240V AC, 50Hz',
        'Wattage': '30W / 35W High Torque',
        'Flow Rate': '20 Liters / Minute',
        'Connector Type': 'Standard spade terminals',
        'Duty Cycle': 'Continuous rated wash & rinse drain',
        'Body Material': 'Glass-reinforced nylon copolymer'
      },
      compatibility: [
        'LG Front Load Inverter Direct Drive Series (7kg, 8kg, 9kg)',
        'Samsung Diamond Drum & EcoBubble Top/Front Loaders',
        'IFB Senator, Elena, and Diva series',
        'Whirlpool Stainwash & BloomWash series'
      ],
      availability: 'Available',
      isActive: true,
      featured: true,
      images: [
        {
          id: 'img-wm-p1',
          imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80',
          altText: 'Washing Machine Drain Pump Motor Assembly Front View',
          sortOrder: 1,
          isPrimary: true
        },
        {
          id: 'img-wm-p2',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
          altText: 'Drain Pump Filter Housing and Impeller Mechanism',
          sortOrder: 2,
          isPrimary: false
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-ac-pcb-02',
      name: 'Universal Inverter AC Indoor & Outdoor Dual Control PCB Board',
      slug: 'universal-inverter-ac-control-pcb-board',
      sku: 'AC-PCB-INV-500',
      categoryId: 'cat-ac',
      brandId: 'b-daikin',
      applianceType: 'Air Conditioner',
      description: 'Advanced microprocessor inverter AC universal replacement kit featuring intelligent IPM drive, electronic expansion valve control, dual temperature sensor harness, and digital LED display receiver.',
      specifications: {
        'Tonnage Support': '1.0 Ton, 1.5 Ton, and 2.0 Ton Inverter ACs',
        'Compressor Type': 'DC Rotary / Twin Rotary BLDC compressors',
        'Input Voltage': '160V - 265V Wide Range AC',
        'Sensors Included': 'Room ambient + Copper pipe coil sensor harness',
        'Remote Control': 'Full function backlight remote included in package'
      },
      compatibility: [
        'Daikin Inverter FTKP / FTKF series',
        'Voltas All-Weather Inverter 1.5T',
        'Carrier Emmerald & Durafresh Inverter units',
        'Panasonic Twin Cool Inverter systems'
      ],
      availability: 'Available',
      isActive: true,
      featured: true,
      images: [
        {
          id: 'img-ac-pcb1',
          imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
          altText: 'Universal Inverter AC Circuit Board Motherboard',
          sortOrder: 1,
          isPrimary: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-mw-mag-03',
      name: 'OEM Microwave High-Power Magnetron Tube',
      slug: 'oem-microwave-high-power-magnetron-tube',
      sku: 'MW-MAG-2M214',
      categoryId: 'cat-mw',
      brandId: 'b-panasonic',
      applianceType: 'Microwave Oven',
      description: 'Original equipment grade 2M214 high-efficiency microwave magnetron tube designed for rapid and uniform dielectric heating with heavy-duty cooling fins.',
      specifications: {
        'Output Power': '900W - 1000W RF Output',
        'Frequency': '2450 MHz standard ISM band',
        'Filament Voltage': '3.15V - 3.3V AC',
        'Mounting Flange': 'Standard 6-hole rectangular bracket with bottom air flow'
      },
      compatibility: [
        'LG Intellowave & Grill series (20L to 28L)',
        'Samsung Convection & Baker series',
        'Panasonic Inverter Genius Microwave ovens',
        'IFB Convection 23BC3 / 25BCG series'
      ],
      availability: 'Available',
      isActive: true,
      featured: true,
      images: [
        {
          id: 'img-mw-mag1',
          imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&auto=format&fit=crop&q=80',
          altText: 'OEM Microwave Oven Magnetron Tube',
          sortOrder: 1,
          isPrimary: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-ro-pump-04',
      name: 'Heavy Duty 100 GPD RO Water Purifier Booster Pump (24V DC)',
      slug: 'heavy-duty-100-gpd-ro-booster-pump-24v',
      sku: 'RO-PUMP-100G',
      categoryId: 'cat-ro',
      brandId: 'b-kent',
      applianceType: 'Water Purifier',
      description: 'Precision copper-wound diaphragm booster pump designed to provide stable 125 PSI feed pressure to reverse osmosis membranes, even in zero or low-gravity inlet water conditions.',
      specifications: {
        'Operating Voltage': '24V DC (SMPS compatible)',
        'Capacity': '100 Gallons Per Day (GPD)',
        'Pressure Output': '125 to 135 PSI constant',
        'Current Draw': '1.2 Amps max',
        'Inlet/Outlet Ports': '3/8" Female NPT threaded brass sleeves'
      },
      compatibility: [
        'Kent Grand, Grand Plus, Pearl, Prime RO models',
        'Aquaguard Geneus, Enhance, Reviva systems',
        'Pureit Marvella, Ultima RO purifiers',
        'All standard domestic cabinet RO units'
      ],
      availability: 'Available',
      isActive: true,
      featured: true,
      images: [
        {
          id: 'img-ro-pump1',
          imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
          altText: '100 GPD RO Booster Pump 24V Diaphragm',
          sortOrder: 1,
          isPrimary: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-ref-relay-05',
      name: '1-Pin & 2-Pin PTC Refrigerator Starter Relay with Thermal Overload Protector (OLP)',
      slug: 'ptc-refrigerator-starter-relay-with-olp',
      sku: 'REF-RELAY-PTC01',
      categoryId: 'cat-ref',
      brandId: 'b-godrej',
      applianceType: 'Refrigerator',
      description: 'Solid-state ceramic disk PTC starter relay combined with bi-metallic disc motor protector. Shields refrigerator compressors against line surges, locked rotor conditions, and overheating.',
      specifications: {
        'Resistance': '15 Ohm / 22 Ohm / 33 Ohm options',
        'Compressor HP': '1/8 HP, 1/6 HP, 1/5 HP, 1/4 HP rating',
        'Thermal Cutoff': '120°C trip with automatic reset',
        'Terminal Configuration': 'Push-on 4.8mm & 6.3mm quick-connect'
      },
      compatibility: [
        'Godrej Edge Pro & Eon Single/Double Door models',
        'Whirlpool IceMagic & NeoFresh series',
        'LG Smart Inverter & Conventional Reciprocating series',
        'Samsung Coolpack & Digital Inverter refrigerators'
      ],
      availability: 'Available',
      isActive: true,
      featured: true,
      images: [
        {
          id: 'img-ref-rel1',
          imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80',
          altText: 'Refrigerator PTC Starter Relay and Overload Protector',
          sortOrder: 1,
          isPrimary: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-ac-cap-06',
      name: 'Heavy Duty Dual Run AC Motor Capacitor (45+5 µF / 440V AC)',
      slug: 'dual-run-ac-motor-capacitor-45-5-uf',
      sku: 'AC-CAP-45-5',
      categoryId: 'cat-ac',
      brandId: 'b-voltas',
      applianceType: 'Air Conditioner',
      description: 'Hermetically sealed round aluminum electrolytic capacitor with explosion-proof internal pressure disconnector. Designed for high ambient outdoor AC condensor and fan motor continuous operation.',
      specifications: {
        'Capacitance': '45 µF (Compressor) + 5 µF (Fan Motor)',
        'Rated Voltage': '440V - 450V AC, 50/60Hz',
        'Tolerance': '±5% High Precision',
        'Operating Temp': '-40°C to +85°C',
        'Life Expectancy': '10,000 Operating Hours Class B'
      },
      compatibility: [
        'Voltas 1.5 Ton and 2 Ton Split AC outdoor units',
        'Carrier, Blue Star, Lloyd, and Daikin outdoor condensing units'
      ],
      availability: 'Available',
      isActive: true,
      featured: false,
      images: [
        {
          id: 'img-ac-cap1',
          imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
          altText: 'Dual Run Motor Capacitor 45 5 MFD',
          sortOrder: 1,
          isPrimary: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-wm-inlet-07',
      name: 'Double Solenoid Water Inlet Valve for Automatic Washing Machines',
      slug: 'double-solenoid-water-inlet-valve-washing-machine',
      sku: 'WM-VALVE-2WAY',
      categoryId: 'cat-wm',
      brandId: 'b-samsung',
      applianceType: 'Washing Machine',
      description: 'Dual electric solenoid water inlet valve with integrated stainless mesh debris strainer and threaded garden hose collar. Controls separate pre-wash and main-wash water intake cycles.',
      specifications: {
        'Voltage': '220V - 240V AC',
        'Operating Pressure': '0.02 MPa to 0.8 MPa (0.2 bar to 8 bar)',
        'Inlet Diameter': '3/4" BSP Standard Male Thread',
        'Coil Resistance': '4.2 kOhm per solenoid coil'
      },
      compatibility: [
        'Samsung Wobble & ActivDual Wash top load machines',
        'LG Smart Inverter top loading washers',
        'Whirlpool WhiteMagic & 360 BloomWash'
      ],
      availability: 'Available',
      isActive: true,
      featured: false,
      images: [
        {
          id: 'img-wm-v1',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
          altText: 'Washing Machine Dual Solenoid Water Valve',
          sortOrder: 1,
          isPrimary: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-ro-mem-08',
      name: 'Original 80 GPD Polyamide Thin-Film Composite RO Membrane',
      slug: '80-gpd-thin-film-composite-ro-membrane',
      sku: 'RO-MEM-80G',
      categoryId: 'cat-ro',
      brandId: 'b-aquaguard',
      applianceType: 'Water Purifier',
      description: 'Certified 0.0001 micron filtration membrane removing heavy metals, arsenic, dissolved mineral salts, bacteria, and pesticides with superior 96% salt rejection efficiency.',
      specifications: {
        'Daily Output': '80 Gallons Per Day (~300 Liters / Day)',
        'Salt Rejection Rate': '96% to 98% TDS reduction',
        'Max Feed TDS': 'Up to 2500 ppm raw water hardness',
        'Membrane Material': 'Cross-linked aromatic polyamide sheet'
      },
      compatibility: [
        'Eureka Forbes Aquaguard Ro models',
        'Kent Supreme, Prime, Sterling',
        'Livpure, Havells, and Blue Star domestic purifiers'
      ],
      availability: 'Available',
      isActive: true,
      featured: false,
      images: [
        {
          id: 'img-ro-m1',
          imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
          altText: 'Domestic RO Membrane Cartridge Element',
          sortOrder: 1,
          isPrimary: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-ref-fan-09',
      name: 'DC 12V Evaporator Cooling Fan Motor for Frost-Free Refrigerators',
      slug: 'dc-12v-evaporator-cooling-fan-motor-refrigerator',
      sku: 'REF-FAN-DC12',
      categoryId: 'cat-ref',
      brandId: 'b-whirlpool',
      applianceType: 'Refrigerator',
      description: 'Brushless low-noise DC circulation fan motor with 3-pin speed sensor feedback plug. Circulates chilled air uniformly between the freezer chest and fresh food compartment.',
      specifications: {
        'Operating Voltage': 'DC 12V 2.5W',
        'RPM': '2100 RPM High Airflow',
        'Shaft Diameter': '3.17mm D-shaft with retention clip',
        'Rotation Direction': 'Counter-clockwise (facing shaft)'
      },
      compatibility: [
        'Whirlpool Icemagic Fresh Frost Free series',
        'Godrej Edge DigiFrost',
        'Haier Bottom Mount Frost Free units'
      ],
      availability: 'Contact Store',
      isActive: true,
      featured: false,
      images: [
        {
          id: 'img-ref-f1',
          imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80',
          altText: 'DC 12V Evaporator Fan Motor for Refrigerator',
          sortOrder: 1,
          isPrimary: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-mw-cap-10',
      name: 'High Voltage Microwave Oil Capacitor 1.05 µF 2100V AC',
      slug: 'microwave-high-voltage-oil-capacitor-1-05uf',
      sku: 'MW-CAP-105-2100',
      categoryId: 'cat-mw',
      brandId: 'b-lg',
      applianceType: 'Microwave Oven',
      description: 'Heavy duty metal can oil-filled capacitor equipped with internal 10 Megohm bleeder safety bleed resistor. Essential partner for microwave doubler diode and magnetron oscillation.',
      specifications: {
        'Capacitance': '1.05 µF ±3%',
        'Working Voltage': '2100V AC dielectric rating',
        'Safety Resistor': '10 MΩ internal discharge bleed resistor',
        'Terminals': 'Dual 6.3mm spade terminals per post'
      },
      compatibility: [
        'Universal compatibility with all 800W to 1200W convection and solo microwave ovens'
      ],
      availability: 'Available',
      isActive: true,
      featured: false,
      images: [
        {
          id: 'img-mw-c1',
          imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&auto=format&fit=crop&q=80',
          altText: 'Microwave Oven High Voltage Capacitor',
          sortOrder: 1,
          isPrimary: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-ac-motor-11',
      name: 'Indoor Split AC Blower Fan Motor (Pure Copper Winding)',
      slug: 'indoor-split-ac-blower-fan-motor',
      sku: 'AC-MOT-BLW-01',
      categoryId: 'cat-ac',
      brandId: 'b-carrier',
      applianceType: 'Air Conditioner',
      description: '3-speed pure copper wire wound indoor cross-flow blower motor featuring dynamic balancing, rubber vibration damper mounts, and thermal fuse cutoff.',
      specifications: {
        'Power': '25W - 35W 3-Speed Tap',
        'Voltage': '220V - 240V 50Hz',
        'Bearing': 'Double sealed NSK miniature ball bearings',
        'Capacitor Requirement': '1.5 µF / 450V external'
      },
      compatibility: [
        'Carrier, Voltas, Hitachi, and Blue Star 1 Ton & 1.5 Ton indoor units'
      ],
      availability: 'Check Availability',
      isActive: true,
      featured: false,
      images: [
        {
          id: 'img-ac-m1',
          imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
          altText: 'Split AC Indoor Cross Flow Blower Fan Motor',
          sortOrder: 1,
          isPrimary: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-wm-lock-12',
      name: 'Front Load Washing Machine Thermal Door Interlock Switch',
      slug: 'front-load-washing-machine-door-interlock-switch',
      sku: 'WM-LOCK-TH03',
      categoryId: 'cat-wm',
      brandId: 'b-bosch',
      applianceType: 'Washing Machine',
      description: 'Bi-metal safety interlock mechanism with instant electromagnetic coil release. Prevents door opening during spin cycle and water heating programs.',
      specifications: {
        'Contact Rating': '16A 250V AC resistive',
        'Delay Unlock Time': '60 - 90 seconds safety delay on power loss',
        'Pinout': '3-pin standard European / Asian configuration (L, N, C)'
      },
      compatibility: [
        'Bosch Serie 4, Serie 6, Maxx front load washers',
        'Siemens iQ300 & iQ500 washer models',
        'IFB Senorita & Elite models'
      ],
      availability: 'Available',
      isActive: true,
      featured: false,
      images: [
        {
          id: 'img-wm-l1',
          imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80',
          altText: 'Washing Machine Door Interlock Switch',
          sortOrder: 1,
          isPrimary: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const initialSettings: SiteSettings = {
    id: 'apex-site-settings',
    businessName: 'Apex Enterprises',
    tagline: 'Your Trusted Appliance Spare Parts Partner',
    logo: '/assets/logo.png',
    phone: '+91 98201 54321',
    whatsapp: '+919820154321',
    email: 'info@apexenterprises.com',
    headquartersAddress: 'Metro Trade Arcade, Central Industrial & Electronics Market, Mumbai 400001',
    homepageHeadline: 'Apex Enterprises',
    homepageSubheadline: 'Appliance Spare Parts for ACs, Washing Machines, Microwaves, Water Purifiers & Refrigerators',
    homepageSupportingText: 'Explore our spare parts catalogue and visit our nearest physical store.',
    aboutText: 'Apex Enterprises has been a trusted supplier of genuine appliance spare parts for over 15 years. We cater to certified service technicians, repair workshops, and individual homeowners who require authentic OEM and high-grade aftermarket components. With multiple physical stores and over 15,000 ready-in-stock parts, we provide instant walk-in availability and expert physical component matching.',
    yearsOfExperience: '15+',
    disclaimer: 'Apex Enterprises is an independent distributor and physical stockist of appliance spare parts. All brand names, logos, and model trademarks mentioned on this website belong strictly to their respective manufacturers and are referenced solely for compatibility and identification purposes. This website is a product catalogue and business locator only; online ordering, cart checkout, and electronic payment are not supported.',
    socialLinks: {
      facebook: 'https://facebook.com/apexenterprises',
      instagram: 'https://instagram.com/apexenterprises',
      youtube: 'https://youtube.com/@apexenterprises'
    },
    callToActionPhone: '+91 98201 54321',
    callToActionWhatsapp: '+919820154321',
    updatedAt: new Date().toISOString()
  };

  return {
    adminUsers: [
      {
        id: 'user-admin-1',
        name: 'Apex Super Admin',
        email: 'admin@apexenterprises.com',
        passwordHash: defaultPasswordHash,
        role: 'super_admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    categories: initialCategories,
    brands: initialBrands,
    products: initialProducts,
    stores: initialStores,
    settings: initialSettings,
    analytics: []
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    ensureDbDirectory();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse database file, resetting to initial seed', err);
        this.data = getInitialData();
        this.persist();
      }
    } else {
      this.data = getInitialData();
      this.persist();
    }
  }

  private persist() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // Users
  getUserByEmail(email: string): AdminUser | undefined {
    return this.data.adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): AdminUser | undefined {
    return this.data.adminUsers.find(u => u.id === id);
  }

  getAllUsers(): Array<Omit<AdminUser, 'passwordHash'>> {
    return this.data.adminUsers.map(({ passwordHash, ...user }) => ({ ...user }));
  }

  updateUserProfile(id: string, name: string, email: string): { user?: Omit<AdminUser, 'passwordHash'>; error?: string } {
    const user = this.data.adminUsers.find(u => u.id === id);
    if (!user) return { error: 'User not found' };

    // Check if email is used by another user
    const existing = this.data.adminUsers.find(u => u.id !== id && u.email.toLowerCase() === email.toLowerCase());
    if (existing) return { error: 'An administrator account with this email already exists' };

    user.name = name.trim();
    user.email = email.trim().toLowerCase();
    user.updatedAt = new Date().toISOString();
    this.persist();

    const { passwordHash, ...sanitized } = user;
    return { user: sanitized };
  }

  updateUserPassword(id: string, newPasswordHash: string): boolean {
    const user = this.data.adminUsers.find(u => u.id === id);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  updateUserLastLogin(id: string): void {
    const user = this.data.adminUsers.find(u => u.id === id);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      this.persist();
    }
  }

  createAdminUser(data: { name: string; email: string; passwordHash: string; role: 'super_admin' | 'admin' }): { user?: Omit<AdminUser, 'passwordHash'>; error?: string } {
    const existing = this.data.adminUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) return { error: 'An administrator with this email already exists' };

    const newUser: AdminUser = {
      id: `user-admin-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.adminUsers.push(newUser);
    this.persist();

    const { passwordHash, ...sanitized } = newUser;
    return { user: sanitized };
  }

  deleteAdminUser(id: string): { success: boolean; error?: string } {
    const index = this.data.adminUsers.findIndex(u => u.id === id);
    if (index === -1) return { success: false, error: 'User not found' };

    // Count how many super_admins are remaining
    const userToDelete = this.data.adminUsers[index];
    if (userToDelete.role === 'super_admin') {
      const superAdmins = this.data.adminUsers.filter(u => u.role === 'super_admin');
      if (superAdmins.length <= 1) {
        return { success: false, error: 'Cannot remove the last Super Administrator account' };
      }
    }

    this.data.adminUsers.splice(index, 1);
    this.persist();
    return { success: true };
  }

  // Categories
  getCategories(activeOnly = true): Category[] {
    const list = activeOnly ? this.data.categories.filter(c => c.isActive) : this.data.categories;
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return this.data.categories.find(c => c.slug === slug);
  }

  getCategoryById(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id);
  }

  createCategory(cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
    const id = `cat-${Date.now()}`;
    const newCat: Category = {
      ...cat,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.categories.push(newCat);
    this.persist();
    return newCat;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = {
      ...this.data.categories[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.categories[idx];
  }

  deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Brands
  getBrands(activeOnly = true): Brand[] {
    const list = activeOnly ? this.data.brands.filter(b => b.isActive) : this.data.brands;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  getBrandById(id: string): Brand | undefined {
    return this.data.brands.find(b => b.id === id);
  }

  createBrand(brand: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Brand {
    const id = `b-${Date.now()}`;
    const newBrand: Brand = {
      ...brand,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.brands.push(newBrand);
    this.persist();
    return newBrand;
  }

  updateBrand(id: string, updates: Partial<Brand>): Brand | null {
    const idx = this.data.brands.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data.brands[idx] = {
      ...this.data.brands[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.brands[idx];
  }

  deleteBrand(id: string): boolean {
    const initialLen = this.data.brands.length;
    this.data.brands = this.data.brands.filter(b => b.id !== id);
    if (this.data.brands.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Products
  getProducts(filters?: {
    categorySlug?: string;
    categoryId?: string;
    brandId?: string;
    applianceType?: string;
    search?: string;
    availability?: string;
    featured?: boolean;
    activeOnly?: boolean;
  }): Product[] {
    let result = [...this.data.products];
    const activeOnly = filters?.activeOnly ?? true;

    if (activeOnly) {
      result = result.filter(p => p.isActive);
    }

    if (filters?.categoryId) {
      result = result.filter(p => p.categoryId === filters.categoryId);
    } else if (filters?.categorySlug) {
      const cat = this.getCategoryBySlug(filters.categorySlug);
      if (cat) {
        result = result.filter(p => p.categoryId === cat.id);
      }
    }

    if (filters?.brandId) {
      result = result.filter(p => p.brandId === filters.brandId);
    }

    if (filters?.applianceType) {
      result = result.filter(p => p.applianceType.toLowerCase() === filters.applianceType!.toLowerCase());
    }

    if (filters?.availability && filters.availability !== 'all') {
      result = result.filter(p => p.availability === filters.availability);
    }

    if (filters?.featured !== undefined) {
      result = result.filter(p => Boolean(p.featured) === filters.featured);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const skuMatch = p.sku.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        const appMatch = p.applianceType.toLowerCase().includes(q);
        const compMatch = p.compatibility.some(c => c.toLowerCase().includes(q));
        const specMatch = Object.entries(p.specifications || {}).some(([k, v]) => 
          k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
        );
        const brandObj = this.getBrandById(p.brandId);
        const brandMatch = brandObj ? brandObj.name.toLowerCase().includes(q) : false;
        return nameMatch || skuMatch || descMatch || appMatch || compMatch || specMatch || brandMatch;
      });
    }

    return result;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.data.products.find(p => p.slug === slug);
  }

  createProduct(prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...prod,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.products.push(newProduct);
    this.persist();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Stores
  getStores(activeOnly = true): Store[] {
    const list = activeOnly ? this.data.stores.filter(s => s.isActive) : this.data.stores;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  getStoreById(id: string): Store | undefined {
    return this.data.stores.find(s => s.id === id);
  }

  createStore(store: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Store {
    const id = `store-${Date.now()}`;
    const newStore: Store = {
      ...store,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.stores.push(newStore);
    this.persist();
    return newStore;
  }

  updateStore(id: string, updates: Partial<Store>): Store | null {
    const idx = this.data.stores.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.stores[idx] = {
      ...this.data.stores[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.stores[idx];
  }

  deleteStore(id: string): boolean {
    const initialLen = this.data.stores.length;
    this.data.stores = this.data.stores.filter(s => s.id !== id);
    if (this.data.stores.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Settings
  getSettings(): SiteSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.settings;
  }

  // Analytics
  logEvent(type: string, details?: Record<string, any>) {
    const event: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.analytics.push(event);
    // Keep max 500 events
    if (this.data.analytics.length > 500) {
      this.data.analytics = this.data.analytics.slice(-500);
    }
    this.persist();
    return event;
  }

  getAnalyticsSummary() {
    const totalEvents = this.data.analytics.length;
    const breakdown: Record<string, number> = {};
    for (const ev of this.data.analytics) {
      breakdown[ev.type] = (breakdown[ev.type] || 0) + 1;
    }
    return {
      totalEvents,
      breakdown,
      recent: this.data.analytics.slice(-20).reverse()
    };
  }

  // Dashboard metrics
  getDashboardStats() {
    return {
      totalProducts: this.data.products.length,
      activeProducts: this.data.products.filter(p => p.isActive).length,
      totalCategories: this.data.categories.length,
      totalBrands: this.data.brands.length,
      totalStores: this.data.stores.length,
      activeStores: this.data.stores.filter(s => s.isActive).length,
      recentProducts: [...this.data.products]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
      analyticsSummary: this.getAnalyticsSummary()
    };
  }
}

export const db = new Database();
