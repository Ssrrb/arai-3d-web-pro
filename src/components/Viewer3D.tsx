import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  RotateCw, 
  Sun, 
  Layers, 
  Camera, 
  Maximize, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  Eye,
  EyeOff,
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import { CameraPreset, LightingMode, Hotspot } from '../types';
import { HOTSPOTS } from '../data/specsData';

interface Viewer3DProps {
  onSelectHotspot?: (hotspot: Hotspot | null) => void;
  activeHotspot?: Hotspot | null;
  onOpenBlueprint?: () => void;
  onOpenSpecs?: () => void;
  onOpenGallery?: () => void;
}

interface ScreenHotspot {
  hotspot: Hotspot;
  x: number;
  y: number;
  visible: boolean;
}

export const Viewer3D: React.FC<Viewer3DProps> = ({
  onSelectHotspot,
  activeHotspot: externalActiveHotspot = null,
  onOpenBlueprint,
  onOpenSpecs,
  onOpenGallery,
}) => {
  const [internalHotspot, setInternalHotspot] = useState<Hotspot | null>(null);
  const activeHotspot = externalActiveHotspot ?? internalHotspot;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [loading, setLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<CameraPreset>('perspective');
  const [lightingMode, setLightingMode] = useState<LightingMode>('studio');
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [showCAD, setShowCAD] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [screenHotspots, setScreenHotspots] = useState<ScreenHotspot[]>([]);
  const [showHotspotPins, setShowHotspotPins] = useState<boolean>(true);
  const [modelStats, setModelStats] = useState<{ meshes: number; triangles: number; size: string }>({
    meshes: 0,
    triangles: 0,
    size: '326.5 x 229.0 x 13.4 mm'
  });
  const [screenshotFlash, setScreenshotFlash] = useState<boolean>(false);

  // Three.js internal refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Camera animation target states
  const targetCamPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);
  const isTransitioningCamera = useRef<boolean>(false);
  const baseModelScale = useRef<number>(1);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#ffffff');
    scene.fog = new THREE.FogExp2('#ffffff', 0.05);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 100);
    camera.position.set(0.4, 0.28, 0.45);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // for screenshots
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 2.5;
    controls.minDistance = 0.12;
    controls.maxPolarAngle = Math.PI / 2 + 0.08; // slightly below horizon
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lights setup
    const lightsGroup = new THREE.Group();
    lightsGroupRef.current = lightsGroup;
    scene.add(lightsGroup);
    setupStudioLights(lightsGroup, 'studio');

    // 6. Ground grid / shadow receiver plane
    const grid = new THREE.GridHelper(2, 40, 0xe2e8f0, 0xf1f5f9);
    grid.position.y = -0.01;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.7;
    scene.add(grid);

    // 7. Load GLB model
    const loader = new GLTFLoader();
    loader.load(
      '/models/Arai_Nimbus_S1_Concept.glb',
      (gltf) => {
        const model = gltf.scene;
        modelGroupRef.current = model;

        let hingeB: THREE.Object3D | null = null;
        let hingeA: THREE.Object3D | null = null;

        let totalTriangles = 0;
        let meshCount = 0;

        // Traverse meshes to filter out studio ground, CAD dimensions, and TOOL boolean cutter objects
        model.traverse((child) => {
          const name = child.name || '';

          // ELIMINATE GHOST EFFECT: Filter out all 26 CAD Boolean cutter/tool objects and dimensions
          if (
            name.startsWith('TOOL') ||
            name.startsWith('Cylinder') ||
            name.startsWith('Dim ') ||
            name.startsWith('Dimension ') ||
            name.startsWith('Extension ') ||
            name.startsWith('Tick ') ||
            name.startsWith('REF ') ||
            name.startsWith('CONTROL') ||
            name.includes('CAD status') ||
            name.includes('Active display window') ||
            name.includes('Studio ground') ||
            name.includes('ground') ||
            name.includes('Boolean') ||
            name.includes('Cutter')
          ) {
            child.visible = false;
            return;
          }

          // Locate hinges
          if (name.includes('Hinge A') || name.includes('lower spindle')) {
            hingeA = child;
          }
          if (name.includes('Hinge B') || name.includes('display spindle')) {
            hingeB = child;
          }

          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            meshCount++;
            if (mesh.geometry) {
              totalTriangles += mesh.geometry.attributes.position ? mesh.geometry.attributes.position.count / 3 : 0;
            }
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((m) => {
                m.transparent = false;
                m.opacity = 1.0;
                m.depthWrite = true;

                if ('roughness' in m) {
                  const standardMat = m as THREE.MeshStandardMaterial;
                  const matName = (standardMat.name || '').toLowerCase();

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
                  } else if (matName.includes('imr top cover') || matName.includes('deck')) {
                    standardMat.color.set(0x1a1a1a);
                    standardMat.roughness = 0.40;
                    standardMat.metalness = 0.06;
                  } else if (matName.includes('micrograin bottom')) {
                    standardMat.color.set(0x181818);
                    standardMat.roughness = 0.65;
                    standardMat.metalness = 0.04;
                  } else if (matName.includes('dark matte bezel') || matName.includes('bezel')) {
                    standardMat.color.set(0x121212);
                    standardMat.roughness = 0.65;
                  } else if (matName.includes('soft black') || matName.includes('elastomer')) {
                    standardMat.color.set(0x111111);
                    standardMat.roughness = 0.78;
                  } else if (matName.includes('low profile keycaps') || matName.includes('charcoal')) {
                    standardMat.color.set(0x1c1c1c);
                    standardMat.roughness = 0.48;
                  } else if (matName.includes('key legends') || matName.includes('legend')) {
                    standardMat.color.set(0xf1f5f9);
                  } else if (matName.includes('glass') || matName.includes('webcam')) {
                    standardMat.roughness = 0.05;
                    standardMat.metalness = 0.15;
                  } else if (matName.includes('hinge') || matName.includes('connector stainless')) {
                    standardMat.color.set(0xb8bec7);
                    standardMat.roughness = 0.24;
                    standardMat.metalness = 0.88;
                  } else {
                    standardMat.color.set(0x1a1a1a);
                    standardMat.roughness = Math.min(Math.max(standardMat.roughness ?? 0.45, 0.25), 0.85);
                  }
                }
              });
            }
          }
        });

        // Open display hinge to standard angle (~112°)
        if (hingeB) {
          (hingeB as THREE.Object3D).rotation.x = -THREE.MathUtils.degToRad(112);
        }
        if (hingeA) {
          (hingeA as THREE.Object3D).rotation.x = 0;
        }

        // Scale model from millimeters to meters
        const MM_TO_METER = 0.001;
        model.scale.set(MM_TO_METER, MM_TO_METER, MM_TO_METER);
        model.updateMatrixWorld(true);

        // Calculate accurate bounding box of visible laptop meshes
        const box = new THREE.Box3();
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && child.visible) {
            box.expandByObject(child);
          }
        });

        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center model at origin and seat on ground plane at y = 0
        model.position.x = -center.x;
        model.position.y = -box.min.y;
        model.position.z = -center.z;

        scene.add(model);
        setModelStats({
          meshes: meshCount,
          triangles: Math.round(totalTriangles),
          size: `${(size.x * 1000).toFixed(1)} x ${(size.z * 1000).toFixed(1)} x ${(size.y * 1000).toFixed(1)} mm`
        });

        // Set initial camera view
        baseModelScale.current = 0.35;
        camera.position.set(0.35, 0.25, 0.38);
        controls.target.set(0, 0.07, 0);
        controls.update();

        setLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        } else {
          setLoadProgress(Math.min(99, Math.round((xhr.loaded / 2200000) * 100)));
        }
      },
      (error) => {
        console.error('Error loading 3D model:', error);
        setErrorMessage('Failed to load 3D GLB model. Check file path.');
        setLoading(false);
      }
    );

    // 8. Resize handling with ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    });
    resizeObserver.observe(container);

    // 9. Animation render loop
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      // Smooth camera interpolation
      if (isTransitioningCamera.current && targetCamPos.current && targetLookAt.current && cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.08);
        controlsRef.current.target.lerp(targetLookAt.current, 0.08);
        controlsRef.current.update();

        if (cameraRef.current.position.distanceTo(targetCamPos.current) < 0.002) {
          cameraRef.current.position.copy(targetCamPos.current);
          controlsRef.current.target.copy(targetLookAt.current);
          isTransitioningCamera.current = false;
        }
      } else if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        updateHotspotsProjection();
      }
    };
    animate();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Update studio lights based on lighting mode
  const setupStudioLights = (group: THREE.Group, mode: LightingMode) => {
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (mode === 'studio') {
      // 3-point Studio lighting as specified in specs.md
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      group.add(ambientLight);

      // Key light: Warm studio key
      const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.2);
      keyLight.position.set(0.6, 0.8, 0.5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.bias = -0.0001;
      group.add(keyLight);

      // Fill light: Soft cool fill
      const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.3);
      fillLight.position.set(-0.7, 0.4, 0.3);
      group.add(fillLight);

      // Rim light: Strong backlight for silhouette & chamfered edges
      const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
      rimLight.position.set(0, 0.9, -0.7);
      group.add(rimLight);
    } else if (mode === 'cyber') {
      const ambientLight = new THREE.AmbientLight(0x0a192f, 1.2);
      group.add(ambientLight);

      const cyanKey = new THREE.DirectionalLight(0x06b6d4, 3.0);
      cyanKey.position.set(0.6, 0.7, 0.5);
      group.add(cyanKey);

      const purpleRim = new THREE.DirectionalLight(0x8b5cf6, 2.5);
      purpleRim.position.set(-0.6, 0.5, -0.6);
      group.add(purpleRim);

      const bottomGlow = new THREE.PointLight(0x38bdf8, 1.5, 2);
      bottomGlow.position.set(0, -0.05, 0);
      group.add(bottomGlow);
    } else if (mode === 'technical') {
      // Clean, flat high-contrast technical blueprint light
      const ambientLight = new THREE.AmbientLight(0xf8fafc, 2.0);
      group.add(ambientLight);

      const topLight = new THREE.DirectionalLight(0xffffff, 2.5);
      topLight.position.set(0, 1.2, 0);
      group.add(topLight);

      const sideLight = new THREE.DirectionalLight(0x93c5fd, 1.5);
      sideLight.position.set(0.8, 0.2, 0.8);
      group.add(sideLight);
    } else if (mode === 'bright') {
      const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
      group.add(ambientLight);

      const sun = new THREE.DirectionalLight(0xfffef0, 2.4);
      sun.position.set(0.5, 1.0, 0.8);
      group.add(sun);
    }
  };

  // Update lighting when mode changes
  useEffect(() => {
    if (!lightsGroupRef.current || !sceneRef.current) return;
    setupStudioLights(lightsGroupRef.current, lightingMode);
    
    if (sceneRef.current) {
      if (lightingMode === 'cyber') {
        sceneRef.current.background = new THREE.Color('#030712');
        if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color = new THREE.Color('#030712');
      } else if (lightingMode === 'technical') {
        sceneRef.current.background = new THREE.Color('#0f172a');
        if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color = new THREE.Color('#0f172a');
      } else if (lightingMode === 'bright') {
        sceneRef.current.background = new THREE.Color('#1e293b');
        if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color = new THREE.Color('#1e293b');
      } else {
        sceneRef.current.background = new THREE.Color('#0b0f17');
        if (sceneRef.current.fog) (sceneRef.current.fog as THREE.FogExp2).color = new THREE.Color('#0b0f17');
      }
    }
  }, [lightingMode]);

  // Update wireframe mode
  useEffect(() => {
    if (!modelGroupRef.current) return;
    modelGroupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((m) => {
            if ('wireframe' in m) {
              (m as THREE.MeshStandardMaterial).wireframe = wireframe;
            }
          });
        }
      }
    });
  }, [wireframe]);

  // Toggle CAD dimensions annotations
  useEffect(() => {
    if (!modelGroupRef.current) return;
    modelGroupRef.current.traverse((child) => {
      const name = child.name || '';
      const isCAD = name.startsWith('Dim') || name.startsWith('Dimension') || name.startsWith('Extension') || name.includes('CAD');
      if (isCAD) {
        child.visible = showCAD;
      }
    });
  }, [showCAD]);

  // Handle auto-rotation
  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.autoRotate = autoRotate;
    controlsRef.current.autoRotateSpeed = 1.8;
  }, [autoRotate]);

  // Project 3D Hotspot positions to 2D screen coordinates
  const updateHotspotsProjection = useCallback(() => {
    if (!cameraRef.current || !containerRef.current || !modelGroupRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = cameraRef.current;

    const projected: ScreenHotspot[] = HOTSPOTS.map((hotspot) => {
      // Hotspot positions in specsData.ts are already defined in world meter space
      const pos = new THREE.Vector3(...hotspot.position);

      // Check if behind camera
      const tempVec = pos.clone().project(camera);
      const isVisible = tempVec.z < 1;

      // 2D screen coordinate mapping
      const screenX = ((tempVec.x + 1) / 2) * width;
      const screenY = ((-tempVec.y + 1) / 2) * height;

      return {
        hotspot,
        x: screenX,
        y: screenY,
        visible: isVisible && screenX > 20 && screenX < width - 20 && screenY > 20 && screenY < height - 20,
      };
    });

    setScreenHotspots(projected);
  }, []);

  // Smooth camera view preset transition
  const setCameraView = (preset: CameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;

    setActivePreset(preset);
    const d = baseModelScale.current || 0.4;
    let targetPos = new THREE.Vector3(d * 1.1, d * 0.8, d * 1.2);
    let targetCenter = new THREE.Vector3(0, d * 0.25, 0);

    switch (preset) {
      case 'perspective':
        targetPos = new THREE.Vector3(d * 1.0, d * 0.7, d * 1.1);
        targetCenter = new THREE.Vector3(0, d * 0.2, 0);
        break;
      case 'front':
        targetPos = new THREE.Vector3(0, d * 0.4, d * 1.5);
        targetCenter = new THREE.Vector3(0, d * 0.25, 0);
        break;
      case 'top':
        targetPos = new THREE.Vector3(0, d * 1.8, 0.001);
        targetCenter = new THREE.Vector3(0, 0, 0);
        break;
      case 'side':
        targetPos = new THREE.Vector3(d * 1.5, d * 0.15, 0);
        targetCenter = new THREE.Vector3(0, d * 0.1, 0);
        break;
      case 'isometric':
        targetPos = new THREE.Vector3(d * 1.2, d * 1.0, d * 1.2);
        targetCenter = new THREE.Vector3(0, d * 0.1, 0);
        break;
      case 'ports':
        targetPos = new THREE.Vector3(-d * 1.1, d * 0.25, 0.05);
        targetCenter = new THREE.Vector3(-d * 0.4, 0.02, 0.05);
        break;
      case 'keyboard':
        targetPos = new THREE.Vector3(0, d * 0.8, d * 0.6);
        targetCenter = new THREE.Vector3(0, 0.02, 0.08);
        break;
    }

    targetCamPos.current = targetPos;
    targetLookAt.current = targetCenter;
    isTransitioningCamera.current = true;
  };

  // Focus camera on a selected hotspot
  const focusHotspot = (hotspot: Hotspot) => {
    if (onSelectHotspot) {
      onSelectHotspot(hotspot);
    }
    if (hotspot.cameraPosition && hotspot.cameraTarget) {
      targetCamPos.current = new THREE.Vector3(...hotspot.cameraPosition);
      targetLookAt.current = new THREE.Vector3(...hotspot.cameraTarget);
      isTransitioningCamera.current = true;
    }
  };

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const factor = direction === 'in' ? 0.8 : 1.25;
    cameraRef.current.position.multiplyScalar(factor);
    controlsRef.current.update();
  };

  const handleResetCamera = () => {
    setCameraView('perspective');
  };

  // Capture clean high-res snapshot
  const handleTakeScreenshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    setScreenshotFlash(true);
    setTimeout(() => setScreenshotFlash(false), 300);

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataURL = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Arai_Stratus_Nimbus_S1_${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#0b0f17]" ref={containerRef}>
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Screenshot Flash Effect */}
      {screenshotFlash && (
        <div className="absolute inset-0 bg-white/40 pointer-events-none transition-opacity duration-300 z-50 animate-pulse" />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0f17]/95 backdrop-blur-md z-40">
          <div className="relative flex flex-col items-center max-w-sm px-6 text-center">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <img src="/images/arai-icon.svg" alt="Arai" className="w-8 h-8 absolute inset-0 m-auto opacity-80" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mb-2">Arai Stratus S1</h2>
            <p className="text-xs text-slate-400 mb-5">
              Loading high-precision CAD model & PBR shaders...
            </p>
            <div className="w-56 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
                style={{ width: `${Math.max(5, loadProgress)}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-cyan-400/90">{loadProgress}% loaded</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {errorMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0b0f17] z-50 p-6 text-center">
          <div className="max-w-md p-6 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-200">
            <h3 className="font-semibold text-lg mb-2">Model Load Error</h3>
            <p className="text-sm text-rose-300/80 mb-4">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Interactive 3D Hotspot Pins */}
      {showHotspotPins && !loading && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {screenHotspots.map(({ hotspot, x, y, visible }) => {
            if (!visible) return null;
            const isSelected = activeHotspot?.id === hotspot.id;

            return (
              <div
                key={hotspot.id}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 hover:scale-110 group"
                style={{ left: `${x}px`, top: `${y}px` }}
                onClick={() => focusHotspot(hotspot)}
              >
                <div className="relative flex items-center justify-center">
                  {/* Outer pulse */}
                  <span className={`absolute w-7 h-7 rounded-full animate-ping opacity-60 ${
                    isSelected ? 'bg-cyan-400' : 'bg-slate-400'
                  }`} />
                  {/* Pin core button */}
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shadow-lg backdrop-blur-sm transition-colors ${
                    isSelected 
                      ? 'bg-cyan-500 border-white text-slate-950 shadow-cyan-500/50' 
                      : 'bg-slate-900/80 border-cyan-400/60 text-cyan-300 group-hover:border-cyan-300'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                  </div>

                  {/* Hover Tooltip */}
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded shadow-xl text-xs text-slate-200">
                    <p className="font-semibold text-[11px] text-cyan-300">{hotspot.title}</p>
                    <p className="text-[10px] text-slate-400">{hotspot.subtitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Hotspot Detail Card (Floating overlay) */}
      {activeHotspot && !loading && (
        <div className="absolute bottom-6 left-6 max-w-sm w-[calc(100%-3rem)] sm:w-96 bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl rounded-xl p-4 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-semibold bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 mb-1">
                {activeHotspot.category}
              </span>
              <h4 className="text-sm font-bold text-white leading-snug">{activeHotspot.title}</h4>
              <p className="text-xs text-slate-400">{activeHotspot.subtitle}</p>
            </div>
            <button
              onClick={() => onSelectHotspot && onSelectHotspot(null)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {activeHotspot.description}
          </p>

          <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-3">
            {activeHotspot.details.map((detail, idx) => (
              <div key={idx} className="flex items-center text-[11px] text-slate-300">
                <Check className="w-3 h-3 text-cyan-400 mr-2 shrink-0" />
                <span>{detail}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
            <button
              onClick={onOpenSpecs}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
            >
              Full Specifications <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-500 font-mono">360° Convertible</span>
          </div>
        </div>
      )}

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-30">
        {/* Left: Quick View Presets */}
        <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800/80 shadow-lg pointer-events-auto">
          {(['perspective', 'front', 'top', 'side', 'keyboard', 'ports', 'isometric'] as CameraPreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => setCameraView(preset)}
              className={`px-2.5 py-1 text-[11px] font-medium capitalize rounded-lg transition-all ${
                activePreset === preset
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Blueprint & Gallery Shortcuts */}
          <div className="flex items-center bg-slate-900/80 backdrop-blur-md rounded-xl p-1 border border-slate-800/80 shadow-lg gap-1">
            <button
              onClick={onOpenBlueprint}
              className="px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Open CAD Blueprint"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Blueprint</span>
            </button>
            <button
              onClick={onOpenGallery}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
              title="View Studio Renders"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Renders</span>
            </button>
            <button
              onClick={onOpenSpecs}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Full Technical Specs"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Specs</span>
            </button>
          </div>

          {/* Screenshot capture */}
          <button
            onClick={handleTakeScreenshot}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-800/80 backdrop-blur-md shadow-lg transition-colors"
            title="Take High-Res Screenshot"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Bottom Right Floating Display Controls Toolbar */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2 pointer-events-none z-30">
        <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800/80 shadow-xl pointer-events-auto">
          {/* Lighting Mode Picker */}
          <div className="flex items-center pr-2 border-r border-slate-800 gap-0.5">
            {(['studio', 'cyber', 'technical', 'bright'] as LightingMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setLightingMode(mode)}
                className={`p-1.5 rounded-lg text-[10px] uppercase font-mono font-medium transition-colors ${
                  lightingMode === mode
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={`Lighting: ${mode}`}
              >
                {mode === 'studio' && 'Studio'}
                {mode === 'cyber' && 'Cyber'}
                {mode === 'technical' && 'Tech'}
                {mode === 'bright' && 'Day'}
              </button>
            ))}
          </div>

          {/* Wireframe toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-1.5 rounded-lg transition-colors ${
              wireframe ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Wireframe Mode"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* CAD Dimensions toggle */}
          <button
            onClick={() => setShowCAD(!showCAD)}
            className={`p-1.5 rounded-lg transition-colors ${
              showCAD ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle CAD Dimension Annotations"
          >
            {showCAD ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Hotspots toggle */}
          <button
            onClick={() => setShowHotspotPins(!showHotspotPins)}
            className={`p-1.5 rounded-lg transition-colors ${
              showHotspotPins ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Hotspot Pins"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Auto Rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg transition-colors ${
              autoRotate ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Auto-Rotate Model"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Zoom In / Zoom Out */}
          <button
            onClick={() => handleZoom('in')}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Technical Model Stats Pill */}
        <div className="bg-slate-950/70 border border-slate-800/80 px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-400 pointer-events-auto flex items-center gap-3">
          <span>{modelStats.size}</span>
          <span>•</span>
          <span>{modelStats.triangles.toLocaleString()} polys</span>
          <span>•</span>
          <span className="text-cyan-400">PBR MT11015</span>
        </div>
      </div>

      {/* Bottom Center Interaction Guide */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-center hidden sm:block">
        <span className="text-[10px] text-slate-500/80 font-mono tracking-wide">
          Left Click + Drag to Orbit • Right Click to Pan • Scroll to Zoom • Click Hotspots for Specs
        </span>
      </div>
    </div>
  );
};
