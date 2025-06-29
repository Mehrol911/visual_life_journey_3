import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeStats, ProfessionTheme } from '../types';
import { Settings, RotateCcw, Info, Maximize2, Minimize2, Sun, Moon, Sunrise, Sunset } from 'lucide-react';
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

interface Branch {
  mesh: THREE.Mesh;
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
  level: number;
  children: Branch[];
}

export const LifeTree3D: React.FC<LifeTree3DProps> = ({ lifeStats, theme }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationRef = useRef<number | null>(null);
  const treeGroupRef = useRef<THREE.Group | null>(null);
  const fallenLeavesRef = useRef<THREE.Group | null>(null);
  const windTimeRef = useRef(0);
  const controlsRef = useRef<any>(null);

  // Lighting references
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const skyRef = useRef<THREE.Mesh | null>(null);

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

    // Camera setup - Start at eye level looking at the tree
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(20, 8, 20); // Eye level view
    cameraRef.current = camera;

    // Renderer setup with enhanced quality
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.physicallyCorrectLights = true;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Setup lighting
    setupLighting(scene);
    
    // Setup environment
    setupEnvironment(scene);

    // Generate tree
    generateLifeTree();

    // Setup camera controls
    setupCameraControls(camera, renderer.domElement);

    // Start animation loop
    animate();

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

  // Update tree when parameters change
  useEffect(() => {
    if (sceneRef.current) {
      generateLifeTree();
      updateLighting();
    }
  }, [lifeStats, theme, treeParams]);

  const setupLighting = (scene: THREE.Scene) => {
    // Clear existing lights
    const lights = scene.children.filter(child => child.type.includes('Light'));
    lights.forEach(light => scene.remove(light));

    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.radius = 8;
    sunLightRef.current = sunLight;
    scene.add(sunLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    fillLight.position.set(-20, 10, -20);
    scene.add(fillLight);

    updateLighting();
  };

  const updateLighting = () => {
    if (!sunLightRef.current || !ambientLightRef.current || !skyRef.current) return;

    const timeOfDay = treeParams.timeOfDay;
    const sunIntensity = treeParams.sunIntensity;

    // Calculate sun position based on time
    const sunAngle = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2; // -90° to 270°
    const sunHeight = Math.sin(sunAngle) * 0.8 + 0.2; // 0.2 to 1.0
    const sunX = Math.cos(sunAngle) * 50;
    const sunY = Math.max(5, sunHeight * 50);
    const sunZ = Math.sin(sunAngle) * 20;

    sunLightRef.current.position.set(sunX, sunY, sunZ);
    sunLightRef.current.lookAt(0, 0, 0);

    // Dynamic lighting based on time of day
    let skyColor: THREE.Color;
    let sunColor: THREE.Color;
    let ambientIntensity: number;
    let sunLightIntensity: number;

    if (timeOfDay >= 6 && timeOfDay < 8) {
      // Dawn (6-8 AM)
      const t = (timeOfDay - 6) / 2;
      skyColor = new THREE.Color().lerpColors(
        new THREE.Color(0x191970), // Midnight blue
        new THREE.Color(0xFF6B35), // Orange
        t
      );
      sunColor = new THREE.Color(0xFFB347); // Peach
      ambientIntensity = 0.3 + t * 0.2;
      sunLightIntensity = 0.5 + t * 0.3;
    } else if (timeOfDay >= 8 && timeOfDay < 18) {
      // Day (8 AM - 6 PM)
      const t = Math.sin(((timeOfDay - 8) / 10) * Math.PI); // Peak at noon
      skyColor = new THREE.Color().lerpColors(
        new THREE.Color(0x87CEEB), // Sky blue
        new THREE.Color(0x4169E1), // Royal blue
        t * 0.3
      );
      sunColor = new THREE.Color(0xFFFAF0); // Floral white
      ambientIntensity = 0.5 + t * 0.2;
      sunLightIntensity = 0.8 + t * 0.4;
    } else if (timeOfDay >= 18 && timeOfDay < 20) {
      // Dusk (6-8 PM)
      const t = (timeOfDay - 18) / 2;
      skyColor = new THREE.Color().lerpColors(
        new THREE.Color(0xFF6B35), // Orange
        new THREE.Color(0x4B0082), // Indigo
        t
      );
      sunColor = new THREE.Color(0xFF4500); // Orange red
      ambientIntensity = 0.5 - t * 0.2;
      sunLightIntensity = 0.6 - t * 0.3;
    } else {
      // Night (8 PM - 6 AM)
      skyColor = new THREE.Color(0x191970); // Midnight blue
      sunColor = new THREE.Color(0x4169E1); // Royal blue (moonlight)
      ambientIntensity = 0.2;
      sunLightIntensity = 0.1;
    }

    // Apply theme color tinting
    const themeColor = new THREE.Color(theme.colors.primary);
    skyColor.lerp(themeColor, 0.1);
    sunColor.lerp(themeColor, 0.05);

    // Update lighting
    sunLightRef.current.color = sunColor;
    sunLightRef.current.intensity = sunLightIntensity * sunIntensity;
    ambientLightRef.current.intensity = ambientIntensity;

    // Update sky
    if (skyRef.current && skyRef.current.material instanceof THREE.MeshBasicMaterial) {
      skyRef.current.material.color = skyColor;
    }

    // Update scene background
    if (sceneRef.current) {
      sceneRef.current.background = skyColor;
      sceneRef.current.fog = new THREE.Fog(skyColor, 50, 200);
    }
  };

  const setupEnvironment = (scene: THREE.Scene) => {
    // Sky sphere
    const skyGeometry = new THREE.SphereGeometry(150, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x87CEEB,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    skyRef.current = sky;
    scene.add(sky);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: new THREE.Color(theme.colors.secondary).multiplyScalar(0.3)
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add grass texture
    addGrassDetails(scene);
  };

  const addGrassDetails = (scene: THREE.Scene) => {
    const grassGroup = new THREE.Group();
    const grassCount = 1000;
    
    for (let i = 0; i < grassCount; i++) {
      const grassGeometry = new THREE.PlaneGeometry(0.5, 1);
      const grassMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color(0x228B22).multiplyScalar(0.7 + Math.random() * 0.3),
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      
      const grass = new THREE.Mesh(grassGeometry, grassMaterial);
      grass.position.x = (Math.random() - 0.5) * 150;
      grass.position.z = (Math.random() - 0.5) * 150;
      grass.position.y = 0.5;
      grass.rotation.y = Math.random() * Math.PI;
      grass.rotation.x = (Math.random() - 0.5) * 0.2;
      
      grassGroup.add(grass);
    }
    
    scene.add(grassGroup);
  };

  const generateLifeTree = () => {
    if (!sceneRef.current) return;

    // Clear existing tree
    if (treeGroupRef.current) {
      sceneRef.current.remove(treeGroupRef.current);
    }
    if (fallenLeavesRef.current) {
      sceneRef.current.remove(fallenLeavesRef.current);
    }

    // Create new tree group
    const treeGroup = new THREE.Group();
    treeGroupRef.current = treeGroup;

    // Create fallen leaves group
    const fallenLeavesGroup = new THREE.Group();
    fallenLeavesRef.current = fallenLeavesGroup;

    // Generate trunk and branches
    const rootBranch = generateTrunk();
    treeGroup.add(rootBranch.mesh);
    
    // Generate branches recursively with proper connections
    generateBranches(rootBranch, treeGroup, 0);

    // Generate fallen leaves
    generateFallenLeaves(fallenLeavesGroup);

    treeGroup.castShadow = true;
    treeGroup.receiveShadow = true;
    
    sceneRef.current.add(treeGroup);
    sceneRef.current.add(fallenLeavesGroup);
  };

  const generateTrunk = (): Branch => {
    const trunkGeometry = new THREE.CylinderGeometry(
      treeParams.trunkRadius * 0.8, 
      treeParams.trunkRadius, 
      treeParams.trunkHeight, 
      16, 
      8
    );

    // Add organic variation to trunk
    const vertices = trunkGeometry.attributes.position.array as Float32Array;
    for (let i = 0; i < vertices.length; i += 3) {
      const noise = (Math.random() - 0.5) * 0.1;
      vertices[i] += noise;
      vertices[i + 2] += noise;
    }
    trunkGeometry.attributes.position.needsUpdate = true;
    trunkGeometry.computeVertexNormals();

    // Enhanced bark material
    const trunkMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x8B4513,
      shininess: 5,
      specular: 0x222222
    });

    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = treeParams.trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;

    return {
      mesh: trunk,
      startPoint: new THREE.Vector3(0, 0, 0),
      endPoint: new THREE.Vector3(0, treeParams.trunkHeight, 0),
      level: 0,
      children: []
    };
  };

  const generateBranches = (parentBranch: Branch, treeGroup: THREE.Group, level: number) => {
    if (level >= treeParams.branchLevels) return;

    const branchCount = Math.floor((6 - level) * treeParams.branchDensity);
    const angleStep = (Math.PI * 2) / branchCount;

    for (let i = 0; i < branchCount; i++) {
      // Calculate branch parameters
      const branchLength = treeParams.trunkHeight * Math.pow(0.7, level + 1) * (0.8 + Math.random() * 0.4);
      const branchRadius = treeParams.trunkRadius * Math.pow(0.6, level + 1);
      
      // Position along parent branch (higher up for higher levels)
      const heightRatio = 0.6 + (level * 0.1) + Math.random() * 0.3;
      const startPoint = parentBranch.startPoint.clone().lerp(parentBranch.endPoint, heightRatio);
      
      // Calculate branch direction
      const baseAngle = i * angleStep + (Math.random() - 0.5) * 0.5;
      const elevationAngle = (treeParams.branchAngle + (Math.random() - 0.5) * 20) * Math.PI / 180;
      
      const direction = new THREE.Vector3(
        Math.cos(baseAngle) * Math.cos(elevationAngle),
        Math.sin(elevationAngle),
        Math.sin(baseAngle) * Math.cos(elevationAngle)
      ).normalize();
      
      const endPoint = startPoint.clone().add(direction.multiplyScalar(branchLength));

      // Create branch geometry
      const branchGeometry = new THREE.CylinderGeometry(
        branchRadius * 0.3, 
        branchRadius, 
        branchLength, 
        8, 
        4
      );

      const branchMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x654321,
        shininess: 5
      });

      const branchMesh = new THREE.Mesh(branchGeometry, branchMaterial);
      
      // Position and orient branch
      branchMesh.position.copy(startPoint.clone().lerp(endPoint, 0.5));
      branchMesh.lookAt(endPoint);
      branchMesh.rotateX(Math.PI / 2);
      
      branchMesh.castShadow = true;
      branchMesh.receiveShadow = true;
      
      treeGroup.add(branchMesh);

      // Create branch object
      const branch: Branch = {
        mesh: branchMesh,
        startPoint,
        endPoint,
        level: level + 1,
        children: []
      };

      parentBranch.children.push(branch);

      // Add leaves to branch ends
      if (level >= treeParams.branchLevels - 2) {
        addLeavesToBranch(branch, treeGroup);
      }

      // Recursively generate child branches
      generateBranches(branch, treeGroup, level + 1);
    }
  };

  const addLeavesToBranch = (branch: Branch, treeGroup: THREE.Group) => {
    const baseLeafCount = Math.floor(20 * treeParams.leafDensity);
    const remainingRatio = lifeStats.days_remaining / (lifeStats.days_lived + lifeStats.days_remaining);
    const leafCount = Math.floor(baseLeafCount * remainingRatio);

    for (let i = 0; i < leafCount; i++) {
      const leaf = createLeaf(true);
      
      // Position around branch end
      const t = 0.7 + Math.random() * 0.3;
      const radius = Math.random() * 1.5;
      const angle = Math.random() * Math.PI * 2;
      
      const leafPosition = branch.startPoint.clone().lerp(branch.endPoint, t);
      leafPosition.x += Math.cos(angle) * radius;
      leafPosition.z += Math.sin(angle) * radius;
      leafPosition.y += (Math.random() - 0.5) * 1;
      
      leaf.position.copy(leafPosition);
      leaf.rotation.x = Math.random() * Math.PI;
      leaf.rotation.y = Math.random() * Math.PI;
      leaf.rotation.z = Math.random() * Math.PI;
      
      treeGroup.add(leaf);
    }
  };

  const createLeaf = (isGreen: boolean): THREE.Mesh => {
    const leafGeometry = new THREE.PlaneGeometry(
      treeParams.leafSize * (0.8 + Math.random() * 0.4), 
      treeParams.leafSize * 1.2 * (0.8 + Math.random() * 0.4)
    );

    const leafMaterial = new THREE.MeshPhongMaterial({
      color: isGreen ? 0x32CD32 : 0x8B4513,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isGreen ? 0.9 : 0.7,
      shininess: isGreen ? 30 : 5
    });

    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.castShadow = false;
    leaf.receiveShadow = true;

    return leaf;
  };

  const generateFallenLeaves = (fallenLeavesGroup: THREE.Group) => {
    const leafCount = Math.min(Math.floor(lifeStats.days_lived / 50), 500);

    for (let i = 0; i < leafCount; i++) {
      const leaf = createLeaf(false);
      
      // Random position on ground around tree
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 25 + 3;
      
      leaf.position.x = Math.cos(angle) * distance;
      leaf.position.z = Math.sin(angle) * distance;
      leaf.position.y = 0.1 + Math.random() * 0.2;
      
      leaf.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      leaf.rotation.y = Math.random() * Math.PI * 2;
      leaf.rotation.z = (Math.random() - 0.5) * 0.3;
      
      fallenLeavesGroup.add(leaf);
    }
  };

  const setupCameraControls = (camera: THREE.PerspectiveCamera, domElement: HTMLElement) => {
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    
    // Spherical coordinates for complete 360° freedom
    let spherical = {
      radius: 30,
      phi: Math.PI / 3,    // Vertical angle (0 = top, PI = bottom)
      theta: Math.PI / 4   // Horizontal angle
    };
    
    const target = new THREE.Vector3(0, 8, 0); // Look at tree center
    const minRadius = 5;
    const maxRadius = 100;

    const onMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;

      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;

      // Update spherical coordinates for complete freedom
      spherical.theta -= deltaX * 0.01; // Horizontal rotation
      spherical.phi += deltaY * 0.01;   // Vertical rotation

      // Allow full vertical rotation (can go above and below)
      spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi));

      mouseX = event.clientX;
      mouseY = event.clientY;

      updateCameraPosition();
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      spherical.radius = Math.max(minRadius, Math.min(maxRadius, spherical.radius * scale));
      updateCameraPosition();
    };

    const updateCameraPosition = () => {
      // Convert spherical coordinates to Cartesian
      const x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      const y = spherical.radius * Math.cos(spherical.phi);
      const z = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);

      camera.position.set(x + target.x, y + target.y, z + target.z);
      camera.lookAt(target);
    };

    domElement.addEventListener('mousedown', onMouseDown);
    domElement.addEventListener('mousemove', onMouseMove);
    domElement.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Store update function and initial position
    controlsRef.current = {
      updateCameraPosition,
      reset: () => {
        spherical.radius = 30;
        spherical.phi = Math.PI / 3;
        spherical.theta = Math.PI / 4;
        updateCameraPosition();
      }
    };

    // Set initial camera position
    updateCameraPosition();
  };

  const animate = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    animationRef.current = requestAnimationFrame(animate);

    windTimeRef.current += 0.01;

    // Wind effect on leaves
    if (treeGroupRef.current && treeParams.windStrength > 0) {
      treeGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) {
          child.rotation.x += Math.sin(windTimeRef.current * 2 + child.position.x) * 0.002 * treeParams.windStrength;
          child.rotation.z += Math.cos(windTimeRef.current * 3 + child.position.z) * 0.002 * treeParams.windStrength;
        }
      });
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const resetCamera = () => {
    if (controlsRef.current && controlsRef.current.reset) {
      controlsRef.current.reset();
    }
  };

  const updateTreeParam = (param: keyof TreeParams, value: number) => {
    setTreeParams(prev => ({ ...prev, [param]: value }));
  };

  const getTimeIcon = () => {
    const hour = treeParams.timeOfDay;
    if (hour >= 6 && hour < 8) return Sunrise;
    if (hour >= 8 && hour < 18) return Sun;
    if (hour >= 18 && hour < 20) return Sunset;
    return Moon;
  };

  const getTimeLabel = () => {
    const hour = treeParams.timeOfDay;
    if (hour >= 6 && hour < 8) return 'Dawn';
    if (hour >= 8 && hour < 18) return 'Day';
    if (hour >= 18 && hour < 20) return 'Dusk';
    return 'Night';
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

      {/* Time of Day Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 p-4 rounded-2xl backdrop-blur-lg border shadow-lg"
        style={{
          background: 'rgba(0,0,0,0.8)',
          borderColor: theme.colors.primary + '40',
          color: 'white'
        }}
      >
        <div className="flex items-center space-x-3">
          {React.createElement(getTimeIcon(), { className: "w-6 h-6", style: { color: theme.colors.primary } })}
          <div className="text-center">
            <div className="text-lg font-bold">{treeParams.timeOfDay}:00</div>
            <div className="text-sm text-gray-300">{getTimeLabel()}</div>
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
                      <span>Sun Intensity</span>
                      <span style={{ color: theme.colors.primary }}>{treeParams.sunIntensity}</span>
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="2.0"
                      step="0.1"
                      value={treeParams.sunIntensity}
                      onChange={(e) => updateTreeParam('sunIntensity', parseFloat(e.target.value))}
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
      <div className="absolute bottom-24 right-24 z-10 flex gap-3">
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

      {/* Enhanced Instructions */}
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
            <p className="text-gray-300 text-xs">🎮 <strong>Full 360° Control:</strong></p>
            <p className="text-gray-300 text-xs">• Drag to rotate around tree</p>
            <p className="text-gray-300 text-xs">• Scroll to zoom in/out</p>
            <p className="text-gray-300 text-xs">• View from any angle!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};