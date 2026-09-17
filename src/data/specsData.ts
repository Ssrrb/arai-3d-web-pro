import { Hotspot, SpecCategory, GalleryItem } from '../types';

export const HOTSPOTS: Hotspot[] = [
  {
    id: 'hinge',
    title: 'Dual 360° Reinforced Hinges',
    subtitle: 'Estructura convertible 2-en-1',
    category: 'hinge',
    description: 'Biaxial dual hinges engineered for 360-degree rotation, transforming effortlessly between Laptop, Tent, Stand, and Tablet modes with high torque retention.',
    details: [
      'Full 360° continuous rotation',
      'Reinforced dual spindle mechanism (Stage 1 & 2)',
      'Tested for >25,000 convertible cycles',
      'Stable touchscreen interaction in all angles'
    ],
    position: [0, 0.02, -0.11],
    cameraTarget: [0, 0.01, -0.09],
    cameraPosition: [0, 0.12, -0.28]
  },
  {
    id: 'display',
    title: '12.2" WUXGA Touchscreen & 1MP Webcam',
    subtitle: 'Pantalla multitáctil con bisel oscuro',
    category: 'display',
    description: 'High-clarity WUXGA IPS touch panel with multi-finger gesture recognition, framed by an MT11015 dark matte textured bezel and centered 1MP HD webcam with optical glass.',
    details: [
      'WUXGA resolution with vibrant color reproduction',
      'Capacitive 10-point multi-touch display',
      '1MP HD webcam with optical glass sensor',
      'Durable edge-to-edge protective glass'
    ],
    position: [0, 0.12, -0.04],
    cameraTarget: [0, 0.1, -0.05],
    cameraPosition: [0, 0.16, 0.22]
  },
  {
    id: 'keyboard',
    title: 'Spanish Low-Profile Keyboard',
    subtitle: 'Teclado ergonómico distribución en español',
    category: 'input',
    description: 'Optimized ChromeOS layout featuring full Spanish distribution including dedicated "Ñ", inverted punctuation (¡, ¿), warm white key legends, and top action keys.',
    details: [
      'ChromeOS layout with dedicated search & function row',
      'Spanish ISO distribution with dedicated Ñ key',
      'Scissor-switch low-profile charcoal keycaps',
      'Spill-resistant keyboard pocket well'
    ],
    position: [0, 0.015, 0.01],
    cameraTarget: [0, 0.01, 0.01],
    cameraPosition: [0, 0.2, 0.05]
  },
  {
    id: 'touchpad',
    title: 'Centered Precision Touchpad',
    subtitle: '114.6 mm x 60.6 mm touchpad',
    category: 'input',
    description: 'Generous 114.6 x 60.6 mm centered precision touchpad with smooth matte surface coating for fluid multi-finger gestures, pinch-to-zoom, and tactile click feedback.',
    details: [
      'Dimensions: 114.6 mm x 60.6 mm',
      'Integrated tactile click switch',
      'Multi-touch gesture support in ChromeOS',
      'Smooth low-friction matte finish'
    ],
    position: [0, 0.013, 0.08],
    cameraTarget: [0, 0.01, 0.08],
    cameraPosition: [0, 0.14, 0.16]
  },
  {
    id: 'left-ports',
    title: 'Left I/O & Audio Suite',
    subtitle: 'Conectividad lateral izquierda',
    category: 'ports',
    description: 'Comprehensive peripheral array featuring high-speed USB-C 3.1 Gen 1, 3.5mm combo audio jack, Kensington security lock, and power indicator LED.',
    details: [
      'USB-C 3.1 Gen 1 (Power Delivery & DisplayPort out)',
      '3.5 mm combined audio/mic jack',
      'Soft white LED status indicator',
      'Kensington lock security slot'
    ],
    position: [-0.16, 0.01, 0.02],
    cameraTarget: [-0.15, 0.01, 0.02],
    cameraPosition: [-0.32, 0.06, 0.02]
  },
  {
    id: 'right-ports',
    title: 'Right I/O, HDMI & Stylus Compartment',
    subtitle: 'Conectividad lateral derecha y Stylus',
    category: 'ports',
    description: 'Features second USB-C 3.1 Gen 1, high-durability USB 3.1 Gen 1 Type-A with deep blue insulator, full-sized HDMI video output, MicroSD card slot, and integrated stylus garage.',
    details: [
      'USB 3.1 Gen 1 Type-A (deep blue insulator)',
      'Full-size HDMI video output',
      'MicroSD card slot for instant storage expansion',
      'Integrated active stylus holder / garage'
    ],
    position: [0.16, 0.01, 0.02],
    cameraTarget: [0.15, 0.01, 0.02],
    cameraPosition: [0.32, 0.06, 0.02]
  },
  {
    id: 'materials',
    title: 'IMR MT11015 & Micrograin PBR Finish',
    subtitle: 'Acabado PBR In-Mold Roller de grado militar',
    category: 'chassis',
    description: 'Top cover (Side A) and palmrest deck (Side C) feature sleek In-Mold Roller (IMR) finish with matte black MT11015 coating, paired with fine micrograin textured bottom (Side D).',
    details: [
      'Top Cover (A) & Deck (C): IMR finish MT11015 matte black (R0.40)',
      'Display Bezel (B): Dark matte anti-glare finish',
      'Bottom Base (D): Micrograin high-traction texture (R0.65)',
      'Chamfered perimeter with 0.20mm C-D parting precision'
    ],
    position: [-0.08, 0.013, 0.06],
    cameraTarget: [0, 0, 0],
    cameraPosition: [-0.18, 0.16, 0.2]
  }
];

export const SPEC_CATEGORIES: SpecCategory[] = [
  {
    id: 'dimensions',
    title: 'Dimensions & Form Factor',
    iconName: 'Maximize2',
    items: [
      { label: 'Device Type', value: '2-in-1 Convertible Chromebook' },
      { label: 'Form Factor', value: '360° Dual Hinge (Laptop, Tent, Stand, Tablet)' },
      { label: 'Chassis Dimensions', value: '326.50 mm x 229.00 mm x 13.40 mm' },
      { label: 'Touchpad Dimensions', value: '114.6 mm x 60.6 mm (Centered)' },
      { label: 'Design Origin', value: 'Arai Nimbus S1 / Stratus Platform' }
    ]
  },
  {
    id: 'display-camera',
    title: 'Display & Camera',
    iconName: 'Monitor',
    items: [
      { label: 'Display Size', value: '12.2 inches (Diagonal)' },
      { label: 'Resolution', value: 'WUXGA IPS Multi-touch' },
      { label: 'Touch Interface', value: '10-point capacitive multitouch' },
      { label: 'Webcam', value: '1 MP HD sensor centered in upper bezel' },
      { label: 'Bezel Finish', value: 'Dark matte anti-reflective bezel' }
    ]
  },
  {
    id: 'materials',
    title: 'Materials & Surface Finish (PBR)',
    iconName: 'Layers',
    items: [
      { label: 'Cover (Side A) & Deck (Side C)', value: 'IMR (In-Mold Roller) Matte Black MT11015 (R0.40)' },
      { label: 'Bezel (Side B) & Base (Side D)', value: 'Micrograin textured matte polymer (R0.65)' },
      { label: 'Connectors & Hinges', value: 'Satin stainless steel & gold contacts' },
      { label: 'Keycaps', value: 'Charcoal low-profile with warm white legends' },
      { label: 'Lighting Configuration', value: '3-point studio lighting (Key, Fill, Rim)' }
    ]
  },
  {
    id: 'ports',
    title: 'Ports & Peripherals',
    iconName: 'Cpu',
    items: [
      { label: 'USB-C Ports', value: '2x USB-C 3.1 Gen 1 (Power Delivery + DP out)' },
      { label: 'USB-A Ports', value: '1x USB 3.1 Gen 1 Type-A (Deep Blue insulator)' },
      { label: 'Video Output', value: '1x Full-size HDMI' },
      { label: 'Storage Expansion', value: '1x MicroSD Card Reader slot' },
      { label: 'Audio', value: '1x 3.5 mm combo headphone/microphone jack' },
      { label: 'Security', value: 'Kensington Security Lock slot' },
      { label: 'Status LED', value: 'Soft white power/charging light pipe' }
    ]
  },
  {
    id: 'controls',
    title: 'Controls & Accessories',
    iconName: 'Sliders',
    items: [
      { label: 'Physical Controls', value: 'Side-mounted Power button & Volume rocker' },
      { label: 'Keyboard', value: 'Spanish distribution (ISO) with Ñ key' },
      { label: 'Stylus', value: 'Integrated stylus slot with active digital pen' },
      { label: 'Durability', value: 'Reinforced dual-axis convertible 360° hinges' }
    ]
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'render-front-iso',
    title: 'Arai Stratus Isometric Perspective',
    description: 'Technical studio render demonstrating the open 12.2" display, low-profile Spanish keyboard, and slim side profile.',
    src: '/images/image4.webp',
    tag: 'Studio Render'
  },
  {
    id: 'render-stand-angle',
    title: 'Convertible 360° Stand Mode',
    description: 'Demonstrating the reinforced dual-stage hinges folded into ergonomic stand mode for presentation and touch interaction.',
    src: '/images/image7.webp',
    tag: 'Convertible'
  },
  {
    id: 'render-side-ports',
    title: 'Chassis I/O & Precision Edges',
    description: 'High-detail view showing the dual USB-C, USB-A 3.1, HDMI, and precision 0.20mm parting line of the chassis.',
    src: '/images/image3.webp',
    tag: 'Hardware I/O'
  },
  {
    id: 'render-tablet-flat',
    title: 'Tablet Mode & Micrograin Base',
    description: 'Fully folded 360° tablet configuration showcasing the textured micrograin bottom plate and perimeter bevels.',
    src: '/images/image10.webp',
    tag: 'Tablet Mode'
  }
];
