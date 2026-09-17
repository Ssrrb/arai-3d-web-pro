import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { RotateCw, Layers, RefreshCw } from 'lucide-react';
import { ProductVariant, FoldMode } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface Scene3DProps {
  currentProduct: ProductVariant;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  customFinishHex?: string;
  customAccentHex?: string;
  isConfiguratorMode?: boolean;
}

export type LaptopFoldMode = FoldMode;

// Fold angle configurations for the dual 360° hinge system
const FOLD_CONFIGS: Record<LaptopFoldMode, {
  hingeA: number; // lower spindle (rad)
  hingeB: number; // display spindle (rad)
  camPos: [number, number, number];
  target: [number, number, number];
}> = {
  closed: {
    hingeA: 0,
    hingeB: 0, // Lid fully shut against the base
    camPos: [0, 0.30, 0.46],
    target: [0, 0.01, 0]
  },
  laptop: {
    hingeA: 0,
    hingeB: -THREE.MathUtils.degToRad(112), // Ergonomic ~112° view
    camPos: [0, 0.40, 0.66],
    target: [0, 0.11, 0]
  },
  stand: {
    hingeA: -THREE.MathUtils.degToRad(140),
    hingeB: -THREE.MathUtils.degToRad(145), // Stand presentation mode
    camPos: [0.26, 0.16, 0.32],
    target: [0, 0.08, 0]
  },
  tent: {
    hingeA: -THREE.MathUtils.degToRad(120),
    hingeB: -THREE.MathUtils.degToRad(140), // Inverted V tent mode
    camPos: [0, 0.25, 0.38],
    target: [0, 0.09, 0]
  },
  tablet: {
    hingeA: -THREE.MathUtils.degToRad(180),
    hingeB: -THREE.MathUtils.degToRad(180), // 360° fully folded tablet
    camPos: [0, 0.52, 0.38],
    target: [0, 0.01, 0]
  }
};

export const Scene3D: React.FC<Scene3DProps> = ({
  currentProduct,
  scrollRef,
  customFinishHex,
  customAccentHex,
  isConfiguratorMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [loading, setLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(!isConfiguratorMode);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<LaptopFoldMode>('laptop');

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);

  // Always-current product reference so the async model load can read the active variant
  const productRef = useRef<ProductVariant>(currentProduct);
  productRef.current = currentProduct;

  // Hinge node references for articulated 360° motion
  const hingeARef = useRef<THREE.Object3D | null>(null);
  const hingeBRef = useRef<THREE.Object3D | null>(null);

  // Store materials to restore or update dynamically
  const bodyMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Apply a fold configuration. `animate = false` snaps instantly (used right after load).
  const applyFold = (mode: LaptopFoldMode, animate: boolean = true) => {
    const config = FOLD_CONFIGS[mode] || FOLD_CONFIGS.laptop;
    const duration = 1.1;
    const ease = 'power3.inOut';

    if (hingeARef.current) {
      if (animate) {
        gsap.to(hingeARef.current.rotation, { x: config.hingeA, duration, ease });
      } else {
        hingeARef.current.rotation.x = config.hingeA;
      }
    }

    if (hingeBRef.current) {
      if (animate) {
        gsap.to(hingeBRef.current.rotation, { x: config.hingeB, duration, ease });
      } else {
        hingeBRef.current.rotation.x = config.hingeB;
      }
    }

    if (cameraRef.current && controlsRef.current) {
      if (animate) {
        gsap.to(cameraRef.current.position, {
          x: config.camPos[0],
          y: config.camPos[1],
          z: config.camPos[2],
          duration: 1.2,
          ease: 'power3.inOut'
        });
        gsap.to(controlsRef.current.target, {
          x: config.target[0],
          y: config.target[1],
          z: config.target[2],
          duration: 1.2,
          ease: 'power3.inOut'
        });
      } else {
        cameraRef.current.position.set(...config.camPos);
        controlsRef.current.target.set(...config.target);
        controlsRef.current.update();
      }
    }
  };

  // Setup Three.js Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // Guards against StrictMode's double mount: a stale async load must never
    // overwrite the hinge/model refs of the currently rendered scene.
    let isActive = true;

    // 1. Scene with Pure White Background as requested
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xffffff);

    // 2. Camera: Positioned to frame the 12.2" convertible laptop (~0.33m wide)
    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.01,
      20
    );
    camera.position.set(0, 0.20, 0.40);
    cameraRef.current = camera;

    // 3. Renderer with high dynamic range tone mapping calibrated for crisp black model on white
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Controls: Smooth damping with balanced polar constraints
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 1.0;
    controls.minDistance = 0.14;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Slightly below horizon
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controls.target.set(0, 0.06, 0);
    controlsRef.current = controls;

    // 5. Lighting: Calibrated 3-Point Studio Lighting for authentic black product on white background
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Key Light (Main soft directional light casting contact shadows)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(1.4, 2.2, 1.4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Fill Light (Soft cool shadow fill)
    const fillLight = new THREE.DirectionalLight(0xf8fafc, 1.2);
    fillLight.position.set(-1.5, 1.4, 0.8);
    scene.add(fillLight);

    // Back / Rim Light (Edge highlights defining dark silhouette against white ground)
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
    rimLight.position.set(0, 1.8, -2.0);
    scene.add(rimLight);

    // Top Soft Downlight
    const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
    topLight.position.set(0, 2.5, 0);
    scene.add(topLight);

    // Realistic Contact Ground Shadow Receiver on Pure White Plane
    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.0005;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 6. Load 3D GLB Model
    const loader = new GLTFLoader();
    loader.load(
      '/models/Arai_Nimbus_S1_Concept.glb',
      (gltf) => {
        // A newer mount superseded this load (React StrictMode); discard it.
        if (!isActive) return;

        const root = gltf.scene;
        modelGroupRef.current = root;
        bodyMaterialsRef.current = [];

        // Traverse model to:
        // A) Eliminate ghost effect: completely filter out all 26 CAD Boolean cutter/tool objects and dimensions
        // B) Render the genuine matte black finish (#1A1A1A / MT11015) as specified in specs.md
        root.traverse((node) => {
          // GLTFLoader sanitizes node names by replacing whitespace with "_"
          // (e.g. "Dim 229.00 mm" -> "Dim_229.00_mm"), so normalize before matching.
          const name = (node.name || '').replace(/_/g, ' ');

          // 1. ELIMINATE GHOST EFFECT:
          // In Blender CAD, boolean cutter objects are named "TOOL | ..." and have no material assigned.
          // Hiding them stops phantom white boxes/cylinders from cutting through the chassis!
          if (
            name.startsWith('TOOL') ||
            name.startsWith('Cylinder') ||
            name.startsWith('Dim ') ||
            name.startsWith('Dimension ') ||
            name.startsWith('Extension ') ||
            name.startsWith('Tick ') ||
            name.startsWith('Closed height') ||
            name.startsWith('REF ') ||
            name.startsWith('CONTROL') ||
            name.includes('CAD status') ||
            name.includes('CAD dimension') ||
            name.includes('Active display window') ||
            name.includes('Studio ground') ||
            name.includes('ground') ||
            name.includes('Boolean') ||
            name.includes('Cutter')
          ) {
            node.visible = false;
            return;
          }

          // 2. Locate Hinge Articulation Nodes
          if (name.includes('Hinge A') || name.includes('lower spindle')) {
            hingeARef.current = node;
          }
          if (name.includes('Hinge B') || name.includes('display spindle')) {
            hingeBRef.current = node;
          }

          // 3. Configure Meshes & Authentic Black PBR Shaders
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((m) => {
                // Ensure opaque solid geometry - no x-ray or ghost transparency
                m.transparent = false;
                m.opacity = 1.0;
                m.depthWrite = true;
                m.depthTest = true;

                if ('roughness' in m) {
                  const standardMat = m as THREE.MeshStandardMaterial;
                  const matName = (standardMat.name || '').toLowerCase();

                  // High-fidelity Screen emission (ChromeOS desktop)
                  if (matName.includes('14 inch lcd') || matName.includes('emission') || mesh.name.includes('Display active')) {
                    standardMat.roughness = 0.08;
                    standardMat.metalness = 0.02;
                    standardMat.emissive = new THREE.Color(0xffffff);
                    standardMat.emissiveIntensity = 1.0;
                    if (standardMat.emissiveMap) {
                      standardMat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                      standardMat.map = standardMat.emissiveMap;
                    } else {
                      new THREE.TextureLoader().load('/images/image7.webp', (tex) => {
                        tex.colorSpace = THREE.SRGBColorSpace;
                        standardMat.map = tex;
                        standardMat.emissiveMap = tex;
                        standardMat.emissive = new THREE.Color(0xffffff);
                        standardMat.emissiveIntensity = 0.95;
                        standardMat.needsUpdate = true;
                      });
                    }
                  }
                  // Top cover & keyboard deck: Genuine MT11015 Smooth Matte Black (#1A1A1A)
                  else if (matName.includes('imr top cover') || matName.includes('deck')) {
                    standardMat.color.set(0x1a1a1a);
                    standardMat.roughness = 0.40;
                    standardMat.metalness = 0.06;
                    bodyMaterialsRef.current.push(standardMat);
                  }
                  // Bottom shell: MT11015 Textured Micrograin Black (#181818)
                  else if (matName.includes('micrograin bottom')) {
                    standardMat.color.set(0x181818);
                    standardMat.roughness = 0.65;
                    standardMat.metalness = 0.04;
                    bodyMaterialsRef.current.push(standardMat);
                  }
                  // Display Bezel: Dark matte bezel
                  else if (matName.includes('dark matte bezel') || matName.includes('bezel')) {
                    standardMat.color.set(0x121212);
                    standardMat.roughness = 0.65;
                    standardMat.metalness = 0.02;
                  }
                  // Soft rubber bumpers, perimeter seal, and feet
                  else if (matName.includes('soft black') || matName.includes('elastomer') || mesh.name.toLowerCase().includes('rubber')) {
                    standardMat.color.set(0x111111);
                    standardMat.roughness = 0.78;
                    standardMat.metalness = 0.0;
                  }
                  // Keyboard Low-profile keycaps: Charcoal Black (#1C1C1C)
                  else if (matName.includes('low profile keycaps') || matName.includes('charcoal')) {
                    standardMat.color.set(0x1c1c1c);
                    standardMat.roughness = 0.48;
                    standardMat.metalness = 0.02;
                  }
                  // Laser-etched key legends: Warm White
                  else if (matName.includes('key legends') || matName.includes('legend')) {
                    standardMat.color.set(0xf1f5f9);
                    standardMat.roughness = 0.55;
                    standardMat.metalness = 0.0;
                  }
                  // 360° Stainless Steel Hinges & machined trims
                  else if (matName.includes('connector stainless') || mesh.name.toLowerCase().includes('hinge')) {
                    standardMat.color.set(0xb8bec7);
                    standardMat.roughness = 0.24;
                    standardMat.metalness = 0.88;
                  }
                  // ARAI Embossed Silver Brand Mark
                  // The supplied artwork is an alpha-cut decal: its fully transparent pixels
                  // carry a blue-teal RGB (76,105,113). alphaTest discards them so only the
                  // genuine silver logo shows instead of a solid blue rectangle.
                  else if (matName.includes('brand artwork') || matName.includes('arai')) {
                    standardMat.color.set(0xffffff);
                    standardMat.roughness = 0.34;
                    standardMat.metalness = 0.35;
                    standardMat.alphaTest = 0.5;
                    standardMat.transparent = false;
                    standardMat.depthWrite = true;
                    if (standardMat.map) {
                      standardMat.map.colorSpace = THREE.SRGBColorSpace;
                      standardMat.map.anisotropy = 8;
                    }
                    standardMat.needsUpdate = true;
                  }
                  // Webcam optical glass
                  else if (matName.includes('glass') || matName.includes('webcam')) {
                    standardMat.color.set(0x0a0c10);
                    standardMat.roughness = 0.05;
                    standardMat.metalness = 0.25;
                  }
                  // Gold connector pins
                  else if (matName.includes('gold')) {
                    standardMat.color.set(0xd4af37);
                    standardMat.roughness = 0.25;
                    standardMat.metalness = 0.85;
                  }
                  // ChromeOS Chrome logo artwork (new model: SVG brand segments)
                  else if (matName.includes('chrome svg')) {
                    if (matName.includes('green')) standardMat.color.set(0x34a853);
                    else if (matName.includes('red')) standardMat.color.set(0xea4335);
                    else if (matName.includes('yellow')) standardMat.color.set(0xfbbc04);
                    else if (matName.includes('white')) standardMat.color.set(0xf8f9fa);
                    else standardMat.color.set(0x0b57d0);
                    standardMat.roughness = 0.45;
                    standardMat.metalness = 0.0;
                  }
                  // General fallback: Solid dark finish
                  else {
                    standardMat.color.set(0x181818);
                    standardMat.roughness = 0.5;
                    standardMat.metalness = 0.1;
                  }
                }
              });
            }
          }
        });

        // 4. Apply the initial fold state defined by the active variant
        //    (Nimbus → closed, Stratus Convertible → 360° tablet, LTE/ED1 → laptop)
        const initialMode: LaptopFoldMode = productRef.current.defaultFold ?? 'laptop';
        setActiveMode(initialMode);
        applyFold(initialMode, false);

        // Update world matrices for accurate bounding box calculation
        root.updateMatrixWorld(true);

        // 5. Scale model from millimeters (326.5mm) to meters (0.3265m)
        const MM_TO_METER = 0.001;
        root.scale.set(MM_TO_METER, MM_TO_METER, MM_TO_METER);
        root.updateMatrixWorld(true);

        // 6. Compute accurate bounding box & seat flush at origin on y = 0
        const box = new THREE.Box3();
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && child.visible) {
            box.expandByObject(child);
          }
        });

        const center = box.getCenter(new THREE.Vector3());

        // Center on X and Z, and place base flush on ground at y = 0
        root.position.x = -center.x;
        root.position.z = -center.z;
        root.position.y = -box.min.y;

        scene.add(root);
        setLoading(false);

        // Smooth camera entrance transition
        if (cameraRef.current && controlsRef.current) {
          gsap.from(cameraRef.current.position, {
            x: 0.15,
            y: 0.45,
            z: 0.65,
            duration: 1.4,
            ease: 'power3.out'
          });
          gsap.from(root.rotation, {
            y: -Math.PI * 0.75,
            duration: 1.4,
            ease: 'power3.out'
          });
        }
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (error) => {
        console.error('Error loading GLTF model:', error);
        setLoading(false);
      }
    );

    // 7. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 8. Responsive Resize Handler with ResizeObserver
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Subtle rotation pulse + automatic fold state when product variant changes
  useEffect(() => {
    if (!modelGroupRef.current) return;

    const root = modelGroupRef.current;
    gsap.killTweensOf(root.rotation);
    gsap.to(root.rotation, {
      y: root.rotation.y + Math.PI * 0.85,
      duration: 1.1,
      ease: 'power2.out'
    });

    // Each variant defines how the convertible should present itself
    const mode: LaptopFoldMode = currentProduct.defaultFold ?? 'laptop';
    setActiveMode(mode);
    applyFold(mode, true);
  }, [currentProduct.id]);

  // Scroll Parallax handling for multi-section showcases
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || !cameraRef.current || !controlsRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) return;
      const progress = scrollTop / maxScroll;

      if (progress < 0.35) {
        // Hero stage: Front-facing perspective
        gsap.to(cameraRef.current.position, {
          x: 0,
          y: 0.20,
          z: 0.40,
          duration: 0.6,
          overwrite: 'auto'
        });
        gsap.to(controlsRef.current.target, {
          x: 0,
          y: 0.06,
          z: 0,
          duration: 0.6,
          overwrite: 'auto'
        });
      } else if (progress < 0.7) {
        // Metrics stage: 360° hinge engineering perspective
        gsap.to(cameraRef.current.position, {
          x: 0.28,
          y: 0.15,
          z: 0.32,
          duration: 0.6,
          overwrite: 'auto'
        });
        gsap.to(controlsRef.current.target, {
          x: 0,
          y: 0.07,
          z: -0.04,
          duration: 0.6,
          overwrite: 'auto'
        });
      } else {
        // Engineering stage: Top-down keyboard and I/O peripheral overview
        gsap.to(cameraRef.current.position, {
          x: -0.18,
          y: 0.35,
          z: 0.22,
          duration: 0.6,
          overwrite: 'auto'
        });
        gsap.to(controlsRef.current.target, {
          x: 0,
          y: 0.03,
          z: 0.02,
          duration: 0.6,
          overwrite: 'auto'
        });
      }
    };

    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, [scrollRef]);

  // Update Auto-Rotate state
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Wireframe toggle
  const toggleWireframe = () => {
    soundEngine.playClick();
    const nextState = !wireframe;
    setWireframe(nextState);

    if (!modelGroupRef.current) return;
    modelGroupRef.current.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && 'wireframe' in mat) {
          mat.wireframe = nextState;
        }
      }
    });
  };

  // Articulated 360° Folding Modes (Closed, Laptop, Stand, Tent, Tablet)
  const setFoldMode = (mode: LaptopFoldMode) => {
    soundEngine.playClick();
    setActiveMode(mode);
    applyFold(mode, true);
  };

  // Reset Camera View
  const resetCamera = () => {
    soundEngine.playClick();
    const config = FOLD_CONFIGS[activeMode] || FOLD_CONFIGS.laptop;

    if (!cameraRef.current || !controlsRef.current) return;
    gsap.to(cameraRef.current.position, {
      x: config.camPos[0],
      y: config.camPos[1],
      z: config.camPos[2],
      duration: 0.9,
      ease: 'power3.out'
    });
    gsap.to(controlsRef.current.target, {
      x: config.target[0],
      y: config.target[1],
      z: config.target[2],
      duration: 0.9,
      ease: 'power3.out'
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full select-none pointer-events-auto bg-white">
      <canvas ref={canvasRef} className="w-full h-full block touch-none cursor-grab active:cursor-grabbing" />

      {/* Loading Screen */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-30">
          <div className="relative w-14 h-14 flex items-center justify-center mb-3">
            <div className="absolute inset-0 border-2 rounded-full border-slate-200 border-t-black animate-spin" />
            <span className="font-mono text-xs font-bold text-slate-900">{loadProgress}%</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-slate-800 font-semibold">
            Cargando Modelo 3D...
          </p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{currentProduct.fullName}</p>
        </div>
      )}

      {/* Floating 3D Control Pill Overlay (Light, High-Contrast UI) */}
      <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Mode selector pills (Laptop, Stand, Tent, Tablet) */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-1.5 rounded-xl flex items-center gap-1 shadow-lg">
          {(['closed', 'laptop', 'stand', 'tent', 'tablet'] as LaptopFoldMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setFoldMode(mode)}
              onMouseEnter={() => soundEngine.playHover()}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all interactive ${
                activeMode === mode
                  ? 'bg-black text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-black hover:bg-slate-100'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Viewport Action Toggles */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-1 rounded-xl flex items-center justify-end gap-1 shadow-lg self-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              setAutoRotate(!autoRotate);
            }}
            onMouseEnter={() => soundEngine.playHover()}
            title={autoRotate ? 'Pausar Rotación' : 'Rotación Automática'}
            className={`p-2 rounded-lg transition-colors interactive ${
              autoRotate ? 'text-black bg-slate-100' : 'text-slate-500 hover:text-black hover:bg-slate-50'
            }`}
            aria-label="Alternar rotación"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleWireframe}
            onMouseEnter={() => soundEngine.playHover()}
            title={wireframe ? 'Vista Sólida' : 'Vista Estructural'}
            className={`p-2 rounded-lg transition-colors interactive ${
              wireframe ? 'text-black bg-slate-100' : 'text-slate-500 hover:text-black hover:bg-slate-50'
            }`}
            aria-label="Alternar modo wireframe"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={resetCamera}
            onMouseEnter={() => soundEngine.playHover()}
            title="Restablecer Cámara"
            className="p-2 rounded-lg text-slate-500 hover:text-black hover:bg-slate-50 transition-colors interactive"
            aria-label="Restablecer cámara"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Orbit Helper Tip */}
      <div className="absolute bottom-4 left-6 z-20 hidden md:flex items-center gap-2 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
          Arrastra para rotar 360° • Zoom con scroll • Selecciona modo arriba
        </span>
      </div>
    </div>
  );
};
