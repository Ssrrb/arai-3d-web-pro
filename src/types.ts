export type CameraPreset = 'perspective' | 'front' | 'top' | 'side' | 'isometric' | 'ports' | 'keyboard';

export type FoldMode = 'closed' | 'laptop' | 'stand' | 'tent' | 'tablet';

export type LightingMode = 'studio' | 'cyber' | 'technical' | 'bright';

export interface ProductVariant {
  id: number;
  namePart1: string;
  namePart2: string;
  fullName: string;
  modelCode: string;
  subtitle: string;
  price: number;
  primaryColor: string;
  lineColor: string;
  accentColor: string;
  themeBg: string;
  finishName: string;
  tagline: string;
  defaultFold?: FoldMode;
  specs: {
    display: string;
    hinge: string;
    ram: string;
    storage: string;
    weight: string;
    battery: string;
    processor: string;
  };
}

export interface CartItem {
  id: string;
  variantId: number;
  name: string;
  modelCode: string;
  finishName: string;
  primaryColor: string;
  accentColor: string;
  price: number;
  ram: string;
  storage: string;
  keyboardLayout: string;
  includeStylus: boolean;
  addedAt: number;
}

export interface CustomLaptopConfig {
  variantId: number;
  baseColor: string;
  accentColor: string;
  hingeColor: string;
  ram: string;
  storage: string;
  keyboardLayout: string;
  includeStylus: boolean;
  notes?: string;
}

export interface Hotspot {
  id: string;
  title: string;
  subtitle: string;
  category: 'hinge' | 'display' | 'chassis' | 'ports' | 'input' | 'stylus';
  description: string;
  details: string[];
  position: [number, number, number];
  cameraTarget?: [number, number, number];
  cameraPosition?: [number, number, number];
}

export interface SpecCategory {
  id: string;
  title: string;
  iconName: string;
  items: {
    label: string;
    value: string;
    note?: string;
  }[];
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  src: string;
  tag: string;
}

