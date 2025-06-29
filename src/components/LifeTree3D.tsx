import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeStats, ProfessionTheme } from '../types';
import { Settings, RotateCcw, Info, Maximize2, Minimize2 } from 'lucide-react';
import * as THREE from 'three';

interface LifeTree3DProps {
  lifeStats: LifeStats;
  theme: ProfessionTheme;
}

interface TreeParams {
  trunkHeight: number;
  trunkRadius: number;
  branchLevels: number;
  branchDensity: number;
  branchAngle: number;
  leafDensity: number;
  leafSize: number;
  canopySpread: number;
  windStrength: number;
  sunIntensity: number;
  timeOfDay: number;
}

export const LifeTree3D: React.FC<LifeTree3DProps> = ({ lifeStats, theme }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationRef = useRef<number | null>(null);
  const treeRef = useRef<THREE.Group | null>(null);
  const fallenLeavesRef = useRef<THREE.Mesh[]>([]);
  const windTimeRef = useRef(0);

  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const [treeParams, setTreeParams] = useState<TreeParams>({
    trunkHeight: 12,
    trunkRadius: 1.2,
    branchLevels: 5,
    branchDensity: 0.8,
    branchAngle: 45,
    leafDensity: 1.0,
    leafSize: 0.4,
    canopySpread: 1.0,
    windStrength: 0.3,
    sunIntensity: 0.8,
    timeOfDay: 12
  });

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Setup lighting based on theme
    setupLighting(scene, theme);
    
    // Setup environment
    setupEnvironment(scene, theme);

    // Generate tree
    generateLifeTree();

    // Start animation loop
    animate();

    // Setup controls
    setupControls(renderer.domElement, camera);

    setIsLoading(false);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update tree when lifeStats or theme changes
  useEffect(() => {
    if (sceneRef.current) {
      generateLifeTree();
    }
  }, [lifeStats, theme, treeParams]);

  const setupLighting = (scene: THREE.Scene, theme: ProfessionTheme) => {
    // Clear existing lights
    const lights = scene.children.filter(child => child.type.includes('Light'));
    lights.forEach(light => scene.remove(light));

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Main directional light (sun) - tinted with theme color
    const sunColor = new THREE.Color(theme.colors.primary);
    const directionalLight = new THREE.DirectionalLight(sunColor, treeParams.sunIntensity);
    directionalLight.position.set(20, 30, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);

    // Fill light with accent color
    const fillColor = new THREE.Color(theme.colors.accent);
    const fillLight = new THREE.DirectionalLight(fillColor, 0.3);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);

    updateSky(scene, theme);
  };

  const updateSky = (scene: THREE.Scene, theme: ProfessionTheme) => {
    const timeOfDay = treeParams.timeOfDay;
    const themeColor = new THREE.Color(theme.colors.primary);
    let skyColor, fogColor;

    if (timeOfDay < 6) {
      // Night - darker theme color
      skyColor = themeColor.clone().multiplyScalar(0.1);
      fogColor = themeColor.clone().multiplyScalar(0.15);
    } else if (timeOfDay < 8) {
      // Dawn - muted theme color
      skyColor = themeColor.clone().multiplyScalar(0.4);
      fogColor = themeColor.clone().multiplyScalar(0.5);
    } else if (timeOfDay < 18) {
      // Day - bright theme-tinted sky
      skyColor = themeColor.clone().lerp(new THREE.Color(0x87CEEB), 0.7);
      fogColor = themeColor.clone().lerp(new THREE.Color(0xa5b8d1), 0.7);
    } else {
      // Dusk - warm theme color
      skyColor = themeColor.clone().multiplyScalar(0.6);
      fogColor = themeColor.clone().multiplyScalar(0.7);
    }

    scene.background = skyColor;
    scene.fog = new THREE.Fog(fogColor, 30, 80);
  };

  const setupEnvironment = (scene: THREE.Scene, theme: ProfessionTheme) => {
    // Ground with theme color
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundColor = new THREE.Color(theme.colors.secondary).multiplyScalar(0.3);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: groundColor,
      transparent: true,
      opacity: 0.8
    });
    const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    // Add grass details with theme tint
    addGrassDetails(scene, theme);
  };

  const addGrassDetails = (scene: THREE.Scene, theme: ProfessionTheme) => {
    const grassCount = 500; // Reduced for performance
    const grassGeometry = new THREE.PlaneGeometry(0.3, 0.6);
    const grassColor = new THREE.Color(theme.colors.secondary).multiplyScalar(0.4);
    const grassMaterial = new THREE.MeshLambertMaterial({ 
      color: grassColor,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < grassCount; i++) {
      const grass = new THREE.Mesh(grassGeometry, grassMaterial);
      grass.position.x = (Math.random() - 0.5) * 80;
      grass.position.z = (Math.random() - 0.5) * 80;
      grass.position.y = 0.3;
      grass.rotation.y = Math.random() * Math.PI;
      grass.rotation.x = Math.random() * 0.2 - 0.1;
      scene.add(grass);
    }
  };

  const generateLifeTree = () => {
    if (!sceneRef.current) return;

    // Clear existing tree
    if (treeRef.current) {
      sceneRef.current.remove(treeRef.current);
    }

    // Clear fallen leaves
    fallenLeavesRef.current.forEach(leaf => sceneRef.current!.remove(leaf));
    fallenLeavesRef.current = [];

    // Create new tree
    const tree = new THREE.Group();
    treeRef.current = tree;

    // Generate trunk
    const trunk = generateTrunk();
    tree.add(trunk);

    // Generate branches recursively
    generateBranches(tree, trunk, 0, treeParams.trunkHeight, treeParams.trunkRadius, 0, 1);

    // Generate fallen leaves
    generateFallenLeaves();

    tree.castShadow = true;
    tree.receiveShadow = true;
    sceneRef.current.add(tree);
  };

  const generateTrunk = () => {
    const trunkGeometry = new THREE.CylinderGeometry(
      treeParams.trunkRadius * 0.8, 
      treeParams.trunkRadius, 
      treeParams.trunkHeight, 
      12, 
      8
    );

    // Add organic variation
    const vertices = trunkGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const noise = (Math.random() - 0.5) * 0.05;
      (vertices as Float32Array)[i] += noise;
      (vertices as Float32Array)[i + 2] += noise;
    }
    trunkGeometry.attributes.position.needsUpdate = true;
    trunkGeometry.computeVertexNormals();

    const trunkMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x654321,
    });

    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = treeParams.trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;

    return trunk;
  };

  const generateBranches = (tree: THREE.Group, parent: THREE.Object3D, level: number, length: number, radius: number, parentAngle: number, branchScale: number) => {
    if (level >= treeParams.branchLevels) return;

    const branchCount = Math.floor((6 - level) * treeParams.branchDensity);
    const newLength = length * (0.6 + Math.random() * 0.2);
    const newRadius = radius * (0.6 + Math.random() * 0.1);

    for (let i = 0; i < branchCount; i++) {
      const branchGroup = new THREE.Group();

      // Create branch geometry
      const branchGeometry = new THREE.CylinderGeometry(
        newRadius * 0.3, 
        newRadius, 
        newLength, 
        6, 
        4
      );

      const branchMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x654321 
      });

      const branch = new THREE.Mesh(branchGeometry, branchMaterial);
      branch.position.y = newLength / 2;
      branch.castShadow = true;
      branchGroup.add(branch);

      // Position and rotate branch
      const angle = (i / branchCount) * Math.PI * 2 + Math.random() * 0.5;
      const elevation = (treeParams.branchAngle + Math.random() * 20 - 10) * Math.PI / 180;

      branchGroup.position.y = length * (0.7 + Math.random() * 0.2);
      branchGroup.position.x = Math.cos(angle) * radius * 0.8;
      branchGroup.position.z = Math.sin(angle) * radius * 0.8;

      branchGroup.rotation.y = angle;
      branchGroup.rotation.z = elevation;
      branchGroup.rotation.x = (Math.random() - 0.5) * 0.3;

      parent.add(branchGroup);

      // Add leaves to branch ends
      if (level >= treeParams.branchLevels - 2) {
        addLeavesToBranch(branchGroup, newLength, level);
      }

      // Recursively generate smaller branches
      generateBranches(tree, branchGroup, level + 1, newLength, newRadius, angle, branchScale * 0.8);
    }
  };

  const addLeavesToBranch = (branchGroup: THREE.Group, branchLength: number, level: number) => {
    const baseLeafCount = Math.floor(15 * treeParams.leafDensity * Math.pow(0.8, level));
    const remainingRatio = lifeStats.days_remaining / (lifeStats.days_lived + lifeStats.days_remaining);
    const leafCount = Math.floor(baseLeafCount * remainingRatio);

    for (let i = 0; i < leafCount; i++) {
      const leaf = createLeaf(true); // Green leaf

      // Position along and around the branch
      const t = (i + 1) / leafCount;
      const radius = Math.random() * 0.5;
      const angle = Math.random() * Math.PI * 2;

      leaf.position.x = Math.cos(angle) * radius;
      leaf.position.y = branchLength * (0.5 + t * 0.4) + Math.random() * 0.5;
      leaf.position.z = Math.sin(angle) * radius;

      leaf.rotation.x = Math.random() * Math.PI;
      leaf.rotation.y = Math.random() * Math.PI;
      leaf.rotation.z = Math.random() * Math.PI;

      branchGroup.add(leaf);
    }
  };

  const createLeaf = (isGreen: boolean) => {
    const leafGeometry = new THREE.PlaneGeometry(
      treeParams.leafSize, 
      treeParams.leafSize * 1.2
    );

    const leafMaterial = new THREE.MeshLambertMaterial({
      color: isGreen ? 0x228B22 : 0x8B4513,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isGreen ? 0.9 : 0.7
    });

    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.castShadow = false;
    leaf.receiveShadow = false;

    return leaf;
  };

  const generateFallenLeaves = () => {
    if (!sceneRef.current) return;

    const leafCount = Math.min(Math.floor(lifeStats.days_lived / 100), 300); // Performance limit

    for (let i = 0; i < leafCount; i++) {
      const leaf = createLeaf(false); // Brown leaf

      // Random position on ground around tree
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 15 + 2;

      leaf.position.x = Math.cos(angle) * distance;
      leaf.position.z = Math.sin(angle) * distance;
      leaf.position.y = 0.1 + Math.random() * 0.1;

      leaf.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      leaf.rotation.y = Math.random() * Math.PI * 2;
      leaf.rotation.z = (Math.random() - 0.5) * 0.3;

      sceneRef.current.add(leaf);
      fallenLeavesRef.current.push(leaf);
    }
  };

  const setupControls = (domElement: HTMLElement, camera: THREE.PerspectiveCamera) => {
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let phi = Math.PI / 4;
    let theta = Math.PI / 4;
    const radius = 25;

    const onMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      targetX += deltaX * 0.01;
      targetY += deltaY * 0.01;

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (event: WheelEvent) => {
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(scale);
    };

    domElement.addEventListener('mousedown', onMouseDown);
    domElement.addEventListener('mousemove', onMouseMove);
    domElement.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel);

    // Update camera position in animation loop
    const updateCamera = () => {
      phi += (targetY - phi) * 0.02;
      theta += (targetX - theta) * 0.02;

      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));

      camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi) + 8;
      camera.position.z = radius * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(0, 8, 0);
    };

    return updateCamera;
  };

  const animate = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    animationRef.current = requestAnimationFrame(animate);

    windTimeRef.current += 0.01;

    // Wind effect on leaves
    if (treeRef.current && treeParams.windStrength > 0) {
      treeRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) {
          child.rotation.x += Math.sin(windTimeRef.current * 2 + child.position.x) * 0.005 * treeParams.windStrength;
          child.rotation.z += Math.cos(windTimeRef.current * 3 + child.position.z) * 0.005 * treeParams.windStrength;
        }
      });
    }

    // Update camera (simple orbit for now)
    const time = Date.now() * 0.0002;
    cameraRef.current.position.x = Math.cos(time) * 25;
    cameraRef.current.position.z = Math.sin(time) * 25;
    cameraRef.current.lookAt(0, 8, 0);

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(15, 10, 15);
      cameraRef.current.lookAt(0, 8, 0);
    }
  };

  const updateTreeParam = (param: keyof TreeParams, value: number) => {
    setTreeParams(prev => ({ ...prev, [param]: value }));
  };

  return (
    <div className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Loading */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm"
          >
            <div className="text-center text-white">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4 mx-auto"></div>
              <p className="text-lg">Growing your Life Tree...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Stats Overlay */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-10 p-6 rounded-2xl backdrop-blur-lg border shadow-lg"
        style={{
          background: 'rgba(0,0,0,0.8)',
          borderColor: theme.colors.primary + '40',
          color: 'white'
        }}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center min-w-[200px]">
            <span className="text-sm text-gray-300">Age:</span>
            <span className="font-bold text-blue-300">{lifeStats.current_age} years</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Days Lived:</span>
            <span className="font-bold text-orange-300">{lifeStats.days_lived.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Days Remaining:</span>
            <span className="font-bold text-green-300">{lifeStats.days_remaining.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Life Progress:</span>
            <span className="font-bold" style={{ color: theme.colors.primary }}>
              {lifeStats.life_percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-6 right-6 z-10 p-6 rounded-2xl backdrop-blur-lg border shadow-lg max-h-[80vh] overflow-y-auto"
            style={{
              background: 'rgba(0,0,0,0.9)',
              borderColor: theme.colors.primary + '40',
              width: '320px'
            }}
          >
            <h3 className="text-white font-bold mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2" style={{ color: theme.colors.primary }} />
              Tree Controls
            </h3>

            <div className="space-y-6">
              {/* Tree Structure */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Tree Structure</h4>
                <div className="space-y-4">
                  <div>
                    <label className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Trunk Height</span>
                      <span style={{ color: theme.colors.primary }}>{treeParams.trunkHeight}</span>
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="20"
                      step="0.5"
                      value={treeParams.trunkHeight}
                      onChange={(e) => updateTreeParam('trunkHeight', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Branch Levels</span>
                      <span style={{ color: theme.colors.primary }}>{treeParams.branchLevels}</span>
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="7"
                      step="1"
                      value={treeParams.branchLevels}
                      onChange={(e) => updateTreeParam('branchLevels', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Branch Density</span>
                      <span style={{ color: theme.colors.primary }}>{treeParams.branchDensity}</span>
                    </label>
                    <input
                      type="range"
                      min="0.4"
                      max="1.2"
                      step="0.1"
                      value={treeParams.branchDensity}
                      onChange={(e) => updateTreeParam('branchDensity', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Foliage */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Foliage</h4>
                <div className="space-y-4">
                  <div>
                    <label className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Leaf Density</span>
                      <span style={{ color: theme.colors.primary }}>{treeParams.leafDensity}</span>
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="2.0"
                      step="0.1"
                      value={treeParams.leafDensity}
                      onChange={(e) => updateTreeParam('leafDensity', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Leaf Size</span>
                      <span style={{ color: theme.colors.primary }}>{treeParams.leafSize}</span>
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="0.8"
                      step="0.05"
                      value={treeParams.leafSize}
                      onChange={(e) => updateTreeParam('leafSize', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Environment */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Environment</h4>
                <div className="space-y-4">
                  <div>
                    <label className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Wind Strength</span>
                      <span style={{ color: theme.colors.primary }}>{treeParams.windStrength}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={treeParams.windStrength}
                      onChange={(e) => updateTreeParam('windStrength', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Time of Day</span>
                      <span style={{ color: theme.colors.primary }}>{treeParams.timeOfDay}:00</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="23"
                      step="1"
                      value={treeParams.timeOfDay}
                      onChange={(e) => updateTreeParam('timeOfDay', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Buttons */}
      <div className="absolute bottom-6 right-6 z-10 flex gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowControls(!showControls)}
          className="p-3 rounded-full backdrop-blur-lg border text-white hover:bg-white/10 transition-colors"
          style={{ 
            background: 'rgba(0,0,0,0.7)',
            borderColor: theme.colors.primary + '40'
          }}
          onMouseEnter={() => setShowTooltip('controls')}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <Settings className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={resetCamera}
          className="p-3 rounded-full backdrop-blur-lg border text-white hover:bg-white/10 transition-colors"
          style={{ 
            background: 'rgba(0,0,0,0.7)',
            borderColor: theme.colors.primary + '40'
          }}
          onMouseEnter={() => setShowTooltip('reset')}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-3 rounded-full backdrop-blur-lg border text-white hover:bg-white/10 transition-colors"
          style={{ 
            background: 'rgba(0,0,0,0.7)',
            borderColor: theme.colors.primary + '40'
          }}
          onMouseEnter={() => setShowTooltip('fullscreen')}
          onMouseLeave={() => setShowTooltip(null)}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Tooltips */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 right-6 z-20 px-3 py-2 rounded-lg backdrop-blur-lg border text-white text-sm"
            style={{ 
              background: 'rgba(0,0,0,0.8)',
              borderColor: theme.colors.primary + '40'
            }}
          >
            {showTooltip === 'controls' && 'Toggle Controls'}
            {showTooltip === 'reset' && 'Reset Camera'}
            {showTooltip === 'fullscreen' && (isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-6 z-10 p-4 rounded-2xl backdrop-blur-lg border shadow-lg"
        style={{
          background: 'rgba(0,0,0,0.8)',
          borderColor: theme.colors.primary + '40',
          color: 'white'
        }}
      >
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 mt-0.5" style={{ color: theme.colors.primary }} />
          <div className="text-sm">
            <p className="font-semibold mb-1">Your 3D Life Tree</p>
            <p className="text-gray-300 text-xs">🌿 Green leaves = Days remaining</p>
            <p className="text-gray-300 text-xs">🍂 Brown leaves = Days lived</p>
            <p className="text-gray-300 text-xs">Drag to rotate • Scroll to zoom</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};