import { ProductVariant } from '../types';

export const ARAI_VARIANTS: ProductVariant[] = [
  {
    id: 1,
    namePart1: 'NIMBUS',
    namePart2: 'PRO S1',
    fullName: 'Arai Nimbus S1 Pro Enterprise',
    modelCode: 'S1-122P',
    subtitle: '12.2" WUXGA Convertible with Active EMR Stylus',
    price: 469.00,
    primaryColor: '#1e293b',
    lineColor: '#38bdf8',
    accentColor: '#3b82f6',
    themeBg: '#1e1b4b',
    finishName: 'Arctic Platinum Titanium',
    tagline: 'Enterprise-grade ChromeOS convertible with stylus garage and optical 1MP webcam',
    defaultFold: 'closed',
    specs: {
      display: '12.2" WUXGA IPS Anti-Glare 400 nits + EMR Pen',
      hinge: 'Reinforced 360° Dual Continuous Hinge',
      ram: '8GB LPDDR5 4800MHz',
      storage: '256GB PCIe NVMe SSD',
      weight: '1.25 kg (2.75 lbs)',
      battery: '52Wh Battery (up to 12.5h) + 45W Fast PD',
      processor: 'Intel Processor N100 Quad Core 3.4GHz'
    }
  },
  {
    id: 2,
    namePart1: 'STRATUS',
    namePart2: 'CONVERTIBLE',
    fullName: 'Arai Stratus S1 Convertible',
    modelCode: 'ME1-122C',
    subtitle: '12.2" WUXGA 360° Multitouch Chromebook',
    price: 389.00,
    primaryColor: '#0d1117',
    lineColor: '#06b6d4',
    accentColor: '#06b6d4',
    themeBg: '#082f49',
    finishName: 'Matte Obsidian MT11015',
    tagline: 'Precision 360° Dual Hinge Convertible for Modern Education and Mobility',
    defaultFold: 'tablet',
    specs: {
      display: '12.2" WUXGA (1920x1200) IPS 10-Point Touch',
      hinge: 'Dual-Stage Biaxial Steel 360° (>25k cycles)',
      ram: '8GB LPDDR4x 3200MHz',
      storage: '128GB High-Speed eMMC 5.1',
      weight: '1.25 kg (2.75 lbs)',
      battery: '48Wh Li-Polymer (up to 12h) + 45W USB-C PD',
      processor: 'Intel Celeron N4500 Dual Core 2.8GHz'
    }
  },
  {
    id: 3,
    namePart1: 'STRATUS',
    namePart2: 'LTE',
    fullName: 'Arai Stratus LTE',
    modelCode: 'ME1-122L',
    subtitle: '12.2" WUXGA 360° Convertible Chromebook with 4G LTE',
    price: 419.00,
    primaryColor: '#0d1117',
    lineColor: '#06b6d4',
    accentColor: '#06b6d4',
    themeBg: '#082f49',
    finishName: 'Matte Obsidian MT11015',
    tagline: 'Always-connected 4G LTE convertible built for classrooms and field work',
    defaultFold: 'laptop',
    specs: {
      display: '12.2" WUXGA (1920x1200) IPS 10-Point Touch',
      hinge: 'Dual-Stage Biaxial Steel 360° (>25k cycles)',
      ram: '8GB LPDDR4x 3200MHz',
      storage: '128GB High-Speed eMMC 5.1',
      weight: '1.27 kg (2.80 lbs)',
      battery: '48Wh Li-Polymer (up to 12h) + 45W USB-C PD',
      processor: 'Intel Celeron N4500 Dual Core 2.8GHz + 4G LTE Modem'
    }
  },
  {
    id: 4,
    namePart1: 'STRATUS',
    namePart2: 'ED1',
    fullName: 'Arai Stratus ED1 Rugged Edition',
    modelCode: 'ED1-122R',
    subtitle: 'MIL-STD-810H Drop-Resistant Classroom Convertible',
    price: 429.00,
    primaryColor: '#1c2a1c',
    lineColor: '#10b981',
    accentColor: '#10b981',
    themeBg: '#064e3b',
    finishName: 'Military Olive Green MT11015',
    tagline: 'Spill-resistant Spanish keyboard, reinforced bumper perimeter, and all-weather traction',
    defaultFold: 'laptop',
    specs: {
      display: '12.2" WUXGA Scratch-Resistant Corning Gorilla Glass',
      hinge: 'Heavy-Duty 360° Stainless Steel Hinges',
      ram: '8GB LPDDR4x 3200MHz',
      storage: '128GB eMMC + MicroSD slot up to 1TB',
      weight: '1.28 kg (2.82 lbs)',
      battery: '50Wh Battery (up to 13h) + 45W USB-C PD',
      processor: 'Intel Celeron N5100 Quad Core 2.8GHz'
    }
  }
];

export const FINISH_PALETTE = [
  { id: 'obsidian', name: 'Matte Obsidian MT11015', hex: '#0d1117', accent: '#06b6d4' },
  { id: 'titanium', name: 'Arctic Platinum Titanium', hex: '#1e293b', accent: '#38bdf8' },
  { id: 'olive', name: 'Military Olive Green', hex: '#1c2a1c', accent: '#10b981' },
  { id: 'carbon', name: 'Deep Midnight Carbon', hex: '#0a0a0c', accent: '#8b5cf6' },
  { id: 'amber', name: 'Forged Cyber Amber', hex: '#18120c', accent: '#ff5500' },
  { id: 'deepblue', name: 'Pacific Deep Navy', hex: '#0a192f', accent: '#38bdf8' }
];

export const HINGE_COLORS = [
  '#06b6d4', // Cyan
  '#38bdf8', // Sky Blue
  '#10b981', // Emerald
  '#ff5500', // Amber
  '#a855f7', // Purple
  '#f59e0b', // Gold
  '#e2e8f0'  // Silver steel
];

export const KEYBOARD_LAYOUTS = [
  { id: 'es-iso', label: 'Spanish ISO (Ñ)', desc: 'Full Spanish layout with dedicated Ñ, inverted ¡ ¿' },
  { id: 'us-ansi', label: 'US International', desc: 'Standard ANSI with AltGr dead keys' },
  { id: 'latam', label: 'Latin American', desc: 'LatAm Spanish standard distribution' }
];

export const MEMORY_TIERS = [
  { id: '8-128', ram: '8GB LPDDR4x', storage: '128GB eMMC', priceDelta: 0 },
  { id: '8-256', ram: '8GB LPDDR5', storage: '256GB NVMe SSD', priceDelta: 60 },
  { id: '16-512', ram: '16GB LPDDR5', storage: '512GB PCIe Gen4 SSD', priceDelta: 140 }
];
