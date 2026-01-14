import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { X, Navigation, MapPin, Sparkles, Scan, Target } from "lucide-react";
import { Product } from "../lib/products";
import { calculateDistance, RoutePoint } from "../lib/navigation";
import { products } from "../lib/products";
import * as THREE from "three";
import { 
  getVirtualBeacons, 
  getBeaconByProductId, 
  calculateDistanceToBeacon, 
  getDirectionToBeacon,
  addVirtualBeacon,
  mapToARWorld,
  arWorldToMap,
  calculateBearingAngle,
  VirtualBeacon 
} from "../lib/virtual-beacons";
import { ArrowIndicator } from "./ArrowIndicator";

// Capacitor imports (with fallback for web)
let Camera: any;
let Device: any;
let Capacitor: any;
let Geolocation: any;

try {
  const cap = require('@capacitor/core');
  Capacitor = cap.Capacitor;
  if (Capacitor && Capacitor.isNativePlatform()) {
    try {
      Camera = require('@capacitor/camera').Camera;
      Device = require('@capacitor/device').Device;
      Geolocation = require('@capacitor/geolocation').Geolocation;
    } catch (e) {
      console.log('Some Capacitor plugins not available');
    }
  }
} catch (e) {
  console.log('Capacitor not available, using web APIs');
}

interface ARNavigationProps {
  currentLocation: { x: number; y: number };
  nextLocation: { x: number; y: number } | null;
  currentProduct: Product | null;
  nextProduct: Product | null;
  routePath: RoutePoint[];
  onClose: () => void;
  onAddPromotion?: (product: Product) => void;
  onAddProduct?: (product: Product) => void;
  onNavigateNext?: () => void;
  onOpenBarcodeScanner?: () => void;
  shoppingList?: Product[];
  isRetailerMode?: boolean; // If true, enable beacon placement mode
}

// Calculate distance in meters (approximate conversion: 10 pixels = 1 meter)
function pixelsToMeters(pixels: number): number {
  return Math.round((pixels / 10) * 10) / 10;
}

export function ARNavigation({
  currentLocation,
  nextLocation,
  currentProduct,
  nextProduct,
  routePath,
  onClose,
  onAddPromotion,
  onAddProduct,
  onNavigateNext,
  onOpenBarcodeScanner,
  shoppingList = [],
  isRetailerMode = false
}: ARNavigationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const arrowRef = useRef<THREE.Group | null>(null);
  const promoBannerRef = useRef<THREE.Group | null>(null);
  const reachedIndicatorRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef<boolean>(false);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  
  // Device position tracking (simulated using sensors)
  const [devicePosition, setDevicePosition] = useState<{ x: number; y: number; z: number }>({
    x: 0, // Start at (0, 0, 0) in AR space
    y: 0, // Ground level initially
    z: 0
  });
  
  const [isAtLocation, setIsAtLocation] = useState(false);
  const [deviceOrientation, setDeviceOrientation] = useState<{ alpha: number; beta: number; gamma: number } | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [targetBeacon, setTargetBeacon] = useState<VirtualBeacon | null>(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  
  // Beacon placement mode state
  const [isPlacingBeacon, setIsPlacingBeacon] = useState(false);
  const [selectedProductForBeacon, setSelectedProductForBeacon] = useState<Product | null>(null);
  const [arrowAngle, setArrowAngle] = useState(0); // radians
  const [arrowDistance, setArrowDistance] = useState(0); // meters
  const [cameraForward, setCameraForward] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: -1 });
  
  // Raycaster for tap-to-place
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const placementMarkerRef = useRef<THREE.Group | null>(null);
  
  // Brand promotional products (Coke)
  const [brandPromotions] = useState(() => [
    {
      id: "promo1",
      name: "Diet Coke",
      brand: "Coca-Cola",
      position: { x: 150, y: 220 },
      price: 1.49,
    },
  ]);

  // Reset position to (0,0,0) when AR starts (entrance position)
  useEffect(() => {
    if (isStreaming) {
      // AR world origin is at entrance
      setDevicePosition({ x: 0, y: 1.6, z: 0 }); // 1.6m is eye height
      setCurrentProductIndex(0);
      setIsAtLocation(false);
      setIsPlacingBeacon(false);
      setSelectedProductForBeacon(null);
    }
  }, [isStreaming]);

  // Find target beacon for first product in shopping list
  useEffect(() => {
    // Determine which product to navigate to
    let targetProduct: Product | null = null;
    
    if (nextProduct) {
      // Use nextProduct if available
      targetProduct = nextProduct;
    } else if (shoppingList && shoppingList.length > 0) {
      // Otherwise use first product from shopping list
      targetProduct = shoppingList[0];
    }
    
    if (targetProduct) {
      // Try to find beacon by product ID
      const beacon = getBeaconByProductId(targetProduct.id);
      if (beacon) {
        setTargetBeacon(beacon);
      } else {
        // Create a default beacon at product's map position if no virtual beacon exists
        // Convert 2D map position to 3D AR coordinates using utility function
        const worldPos = mapToARWorld(targetProduct.position);
        
        const defaultBeacon: VirtualBeacon = {
          id: `default-${targetProduct.id}`,
          name: targetProduct.name,
          productId: targetProduct.id,
          worldPosition: worldPos,
          mapPosition: targetProduct.position,
          placedAt: new Date().toISOString(),
          placedBy: "system"
        };
        setTargetBeacon(defaultBeacon);
      }
    } else {
      setTargetBeacon(null);
    }
  }, [nextProduct, shoppingList]);

  // Track if we've reached the beacon location
  useEffect(() => {
    if (!isStreaming || !targetBeacon) {
      setIsAtLocation(false);
      return;
    }

    // Check distance to beacon
    const checkDistance = () => {
      if (!targetBeacon) return;
      
      // Calculate distance from current device position to beacon (in meters)
      const distance = calculateDistanceToBeacon(devicePosition, targetBeacon);
      setIsAtLocation(distance < 0.5); // Within 0.5 meters
      
      // If reached beacon, move to next product
      if (distance < 0.5 && shoppingList && shoppingList.length > currentProductIndex + 1) {
        // Move to next product in shopping list
        const nextIndex = currentProductIndex + 1;
        setCurrentProductIndex(nextIndex);
        const nextProduct = shoppingList[nextIndex];
        
        // Find beacon for next product
        const nextBeacon = getBeaconByProductId(nextProduct.id);
        if (nextBeacon) {
          setTargetBeacon(nextBeacon);
          setIsAtLocation(false); // Reset for new beacon
        }
      }
    };
    
    const interval = setInterval(checkDistance, 100);
    return () => clearInterval(interval);
  }, [isStreaming, targetBeacon, devicePosition, shoppingList, currentProductIndex]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !isStreaming) return;

    try {
      const container = containerRef.current;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      if (width === 0 || height === 0) {
        console.warn("Container has zero dimensions, waiting...");
        return;
      }

      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Create camera (matches video feed perspective)
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      camera.position.set(0, 1.6, 0); // Eye height ~1.6m
      cameraRef.current = camera;

      // Create renderer
      const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
      directionalLight.position.set(5, 10, 5);
      scene.add(directionalLight);

      // Create raycaster for tap-to-place beacon
      const raycaster = new THREE.Raycaster();
      raycasterRef.current = raycaster;

      // Create placement marker (visible when placing beacon)
      const createPlacementMarker = () => {
        const markerGroup = new THREE.Group();
        
        // Ring indicator
        const ringGeometry = new THREE.RingGeometry(0.1, 0.15, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x00ff00,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2; // Lay flat on ground
        markerGroup.add(ring);
        
        // Vertical line
        const lineGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8);
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.y = 0.75; // Half height
        markerGroup.add(line);
        
        markerGroup.visible = false;
        return markerGroup;
      };

      placementMarkerRef.current = createPlacementMarker();
      scene.add(placementMarkerRef.current);

      // Create arrow pointing to beacon - fixed on screen, only rotates
      const createArrow = () => {
        const arrowGroup = new THREE.Group();
        
        // Arrow shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
        const shaftMaterial = new THREE.MeshBasicMaterial({ color: 0x00d9ff });
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.position.set(0, 0, 0);
        shaft.rotation.z = Math.PI / 2; // Point along X axis
        arrowGroup.add(shaft);
        
        // Arrow head
        const headGeometry = new THREE.ConeGeometry(0.08, 0.25, 8);
        const headMaterial = new THREE.MeshBasicMaterial({ color: 0x00d9ff });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0.4, 0, 0); // At the front of the shaft
        head.rotation.z = -Math.PI / 2; // Point forward
        arrowGroup.add(head);
        
        // Position fixed on screen (center, slightly below center)
        arrowGroup.position.set(0, -0.2, -1.5);
        
        return arrowGroup;
      };

      arrowRef.current = createArrow();
      // Add arrow as child of camera so it stays fixed on screen
      camera.add(arrowRef.current);

      // Create "reached" indicator (circular)
      const createReachedIndicator = () => {
        const indicatorGroup = new THREE.Group();
        
        // Circular background
        const circleGeometry = new THREE.CircleGeometry(0.15, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x00ff00,
          transparent: true,
          opacity: 0.9
        });
        const circle = new THREE.Mesh(circleGeometry, circleMaterial);
        indicatorGroup.add(circle);
        
        // Text plane for "Reached" message
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 256;
        textCanvas.height = 64;
        const textCtx = textCanvas.getContext('2d');
        if (textCtx) {
          textCtx.fillStyle = '#ffffff';
          textCtx.font = 'bold 24px Arial';
          textCtx.textAlign = 'center';
          textCtx.textBaseline = 'middle';
          textCtx.fillText('Reached!', textCanvas.width / 2, textCanvas.height / 2);
        }
        const textTexture = new THREE.CanvasTexture(textCanvas);
        const textMaterial = new THREE.MeshBasicMaterial({ 
          map: textTexture,
          transparent: true,
          opacity: 0.9
        });
        const textPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(0.2, 0.05),
          textMaterial
        );
        textPlane.position.set(0, -0.2, 0.01);
        indicatorGroup.add(textPlane);
        
        // Position fixed on screen (same as arrow position)
        indicatorGroup.position.set(0, -0.2, -1.5);
        indicatorGroup.visible = false; // Hidden by default
        
        return indicatorGroup;
      };

      reachedIndicatorRef.current = createReachedIndicator();
      camera.add(reachedIndicatorRef.current);

      // Create promotional banner at shelf height (~1.5m)
      const createPromoBanner = () => {
        const bannerGroup = new THREE.Group();
        
        // Banner background
        const bannerGeometry = new THREE.PlaneGeometry(0.8, 0.6);
        const bannerMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xdc2626,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9
        });
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        bannerGroup.add(banner);
        
        // Position at shelf height, random position in front
        const randomX = (Math.random() - 0.5) * 3;
        const randomZ = -2 - Math.random() * 2;
        bannerGroup.position.set(randomX, 1.5, randomZ);
        
        return bannerGroup;
      };

      promoBannerRef.current = createPromoBanner();
      scene.add(promoBannerRef.current);


      // Animation loop
      isAnimatingRef.current = true;
      const animate = () => {
        if (!isAnimatingRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
          return;
        }
        
        try {
          animationFrameRef.current = requestAnimationFrame(animate);
          
          // Update camera forward vector for arrow calculation
          if (cameraRef.current) {
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(cameraRef.current.quaternion);
            setCameraForward({ x: forward.x, y: forward.y, z: forward.z });
          }

          // Calculate arrow angle and distance for 2D overlay
          if (targetBeacon && !isPlacingBeacon) {
            try {
              const distance = calculateDistanceToBeacon(devicePosition, targetBeacon);
              setArrowDistance(distance);
              
              if (distance < 0.5) {
                // Reached - hide arrow
                setArrowDistance(0);
              } else {
                // Calculate bearing angle
                const angle = calculateBearingAngle(devicePosition, cameraForward, targetBeacon);
                setArrowAngle(angle);
              }
            } catch (err) {
              console.error("Error calculating arrow:", err);
            }
          } else {
            setArrowDistance(0);
          }

          // Update 3D arrow (for backward compatibility, but we'll use 2D overlay)
          if (arrowRef.current && reachedIndicatorRef.current && targetBeacon && !isPlacingBeacon) {
            try {
              const distance = calculateDistanceToBeacon(devicePosition, targetBeacon);
              const hasReached = distance < 0.5;
              
              if (hasReached) {
                arrowRef.current.visible = false;
                reachedIndicatorRef.current.visible = true;
              } else {
                arrowRef.current.visible = false; // Hide 3D arrow, use 2D overlay instead
                reachedIndicatorRef.current.visible = false;
              }
            } catch (err) {
              console.error("Error updating arrow:", err);
            }
          } else if (arrowRef.current) {
            arrowRef.current.visible = false;
          }
          
          // Update camera rotation based on device orientation
          // Note: Arrow and distance box are positioned in camera space, so they stay fixed on screen
          if (deviceOrientation && cameraRef.current) {
            try {
              const alpha = (deviceOrientation.alpha || 0) * (Math.PI / 180);
              const beta = (deviceOrientation.beta || 0) * (Math.PI / 180);
              const gamma = (deviceOrientation.gamma || 0) * (Math.PI / 180);
              
              // Apply device rotation to camera
              cameraRef.current.rotation.set(beta, alpha, -gamma, 'YXZ');
            } catch (err) {
              console.error("Error updating camera rotation:", err);
            }
          }
          
          renderer.render(scene, camera);
        } catch (err) {
          console.error("Error in animation loop:", err);
          isAnimatingRef.current = false;
        }
      };
      
      animate();

      // Handle resize
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
        try {
          const width = containerRef.current.clientWidth || window.innerWidth;
          const height = containerRef.current.clientHeight || window.innerHeight;
          if (width > 0 && height > 0) {
            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(width, height);
          }
        } catch (err) {
          console.error("Error handling resize:", err);
        }
      };
      window.addEventListener('resize', handleResize);
      
      // Initial render
      try {
        renderer.render(scene, camera);
      } catch (err) {
        console.error("Error in initial render:", err);
      }
      
      // Store handleResize for cleanup
      const cleanup = () => {
        isAnimatingRef.current = false;
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (rendererRef.current) {
          try {
            rendererRef.current.dispose();
            if (containerRef.current && rendererRef.current.domElement.parentNode === containerRef.current) {
              containerRef.current.removeChild(rendererRef.current.domElement);
            }
          } catch (err) {
            console.error("Error cleaning up renderer:", err);
          }
          rendererRef.current = null;
        }
        if (arrowRef.current && cameraRef.current) {
          try {
            // Remove arrow from camera before clearing
            if (cameraRef.current.children.includes(arrowRef.current)) {
              cameraRef.current.remove(arrowRef.current);
            }
            arrowRef.current.clear();
          } catch (err) {
            console.error("Error clearing arrow:", err);
          }
          arrowRef.current = null;
        }
        if (promoBannerRef.current) {
          try {
            promoBannerRef.current.clear();
          } catch (err) {
            console.error("Error clearing banner:", err);
          }
          promoBannerRef.current = null;
        }
        if (reachedIndicatorRef.current && cameraRef.current) {
          try {
            // Remove reached indicator from camera before clearing
            if (cameraRef.current.children.includes(reachedIndicatorRef.current)) {
              cameraRef.current.remove(reachedIndicatorRef.current);
            }
            reachedIndicatorRef.current.clear();
          } catch (err) {
            console.error("Error clearing reached indicator:", err);
          }
          reachedIndicatorRef.current = null;
        }
        if (sceneRef.current) {
          try {
            while(sceneRef.current.children.length > 0) {
              sceneRef.current.remove(sceneRef.current.children[0]);
            }
          } catch (err) {
            console.error("Error clearing scene:", err);
          }
          sceneRef.current = null;
        }
        cameraRef.current = null;
      };
      
      return cleanup;
    } catch (err) {
      console.error("Error initializing Three.js scene:", err);
      setCameraError("Failed to initialize AR scene. Please try again.");
      setIsStreaming(false);
      return () => {}; // Return empty cleanup function
    }
  }, [isStreaming, devicePosition, targetBeacon, isAtLocation, deviceOrientation, isPlacingBeacon, cameraForward]);

  // Request device orientation
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        setDeviceOrientation({
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma
        });
        setCompassHeading(event.alpha || 0);
      }
    };

    if (typeof DeviceOrientationEvent !== "undefined" && 
        typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
          }
        });
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  // Start camera
  const startCamera = async () => {
    setCameraError("");
    try {
      const isNative = Capacitor && Capacitor.isNativePlatform();
      
      if (isNative && Camera) {
        const permissionStatus = await Camera.requestPermissions();
        if (permissionStatus.camera !== 'granted') {
          setCameraError("Camera permission denied. Please enable camera access in Settings.");
          return;
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      setCameraError(error?.message || "Unable to access camera");
      setIsStreaming(false);
    }
  };

  // Shut down camera
  const shutdownCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  // Auto-start camera
  useEffect(() => {
    startCamera();
    return () => {
      shutdownCamera();
    };
  }, []);

  // Handle tap/click for beacon placement
  const handleTap = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isPlacingBeacon || !raycasterRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Get tap coordinates
    let clientX: number, clientY: number;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    // Convert to normalized device coordinates (-1 to +1)
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast from camera through tap point
    raycasterRef.current.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    // Create a ground plane at y=0 for intersection
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();
    raycasterRef.current.ray.intersectPlane(groundPlane, intersectionPoint);

    // Place beacon at intersection point
    if (selectedProductForBeacon) {
      const worldPos = {
        x: intersectionPoint.x,
        y: 1.5, // Shelf height
        z: intersectionPoint.z
      };
      const mapPos = arWorldToMap(worldPos);

      try {
        const newBeacon = addVirtualBeacon({
          name: selectedProductForBeacon.name,
          productId: selectedProductForBeacon.id,
          worldPosition: worldPos,
          mapPosition: mapPos,
          placedBy: "retailer"
        });

        alert(`Beacon placed for ${selectedProductForBeacon.name}!`);
        setIsPlacingBeacon(false);
        setSelectedProductForBeacon(null);
        
        // Update placement marker position
        if (placementMarkerRef.current) {
          placementMarkerRef.current.position.copy(intersectionPoint);
          placementMarkerRef.current.position.y = 0;
          placementMarkerRef.current.visible = true;
          // Hide after 2 seconds
          setTimeout(() => {
            if (placementMarkerRef.current) {
              placementMarkerRef.current.visible = false;
            }
          }, 2000);
        }
      } catch (error) {
        console.error("Error placing beacon:", error);
        alert("Failed to place beacon. Please try again.");
      }
    }
  };

  // Track device position using accelerometer (if available)
  useEffect(() => {
    if (!isStreaming) return;

    let lastAcceleration: { x: number; y: number; z: number } | null = null;
    let velocity = { x: 0, y: 0, z: 0 };
    let lastTime = Date.now();

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const now = Date.now();
      const dt = (now - lastTime) / 1000; // seconds
      lastTime = now;

      const accel = event.accelerationIncludingGravity;
      if (accel.x === null || accel.y === null || accel.z === null) return;

      // Convert acceleration to m/s² (iOS gives g-force, Android gives m/s²)
      // Assume iOS for now (multiply by ~9.8)
      const ax = (accel.x || 0) * 9.8;
      const ay = (accel.y || 0) * 9.8;
      const az = (accel.z || 0) * 9.8;

      // Simple integration (not accurate, but gives relative movement)
      if (lastAcceleration) {
        // Update velocity (integrate acceleration)
        velocity.x += (ax + lastAcceleration.x) * 0.5 * dt;
        velocity.y += (ay + lastAcceleration.y) * 0.5 * dt;
        velocity.z += (az + lastAcceleration.z) * 0.5 * dt;

        // Apply damping
        velocity.x *= 0.9;
        velocity.y *= 0.9;
        velocity.z *= 0.9;

        // Update position (integrate velocity)
        setDevicePosition(prev => ({
          x: prev.x + velocity.x * dt,
          y: Math.max(1.6, prev.y + velocity.y * dt), // Keep at eye height minimum
          z: prev.z + velocity.z * dt
        }));
      }

      lastAcceleration = { x: ax, y: ay, z: az };
    };

    // Request permission for iOS
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
          }
        });
    } else {
      window.addEventListener('devicemotion', handleDeviceMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [isStreaming]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full">
        {/* Camera View */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Three.js AR Overlay */}
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          onClick={isPlacingBeacon ? handleTap : undefined}
          onTouchStart={isPlacingBeacon ? handleTap : undefined}
        />
        
        {/* 2D Arrow Indicator Overlay */}
        {isStreaming && targetBeacon && !isPlacingBeacon && (
          <ArrowIndicator
            angle={arrowAngle}
            distanceMeters={arrowDistance}
            visible={arrowDistance > 0}
          />
        )}
        
        {/* UI Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
              <div className="bg-black/95 rounded-lg p-6 border border-cyan-500/50 max-w-sm mx-4">
                <h3 className="text-white text-lg font-semibold mb-2">AR Navigation</h3>
                {cameraError ? (
                  <p className="text-red-400 text-sm mb-4">{cameraError}</p>
                ) : (
                  <p className="text-cyan-300 text-sm mb-4">Starting camera...</p>
                )}
                <Button
                  onClick={startCamera}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                >
                  Start Camera
                </Button>
              </div>
            </div>
          )}
          
          {/* Barcode Scanner Button - Show when at location */}
          {isStreaming && isAtLocation && nextProduct && onOpenBarcodeScanner && !isPlacingBeacon && (
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
              <Button
                onClick={onOpenBarcodeScanner}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                size="lg"
              >
                <Scan className="h-5 w-5 mr-2" />
                Scan Barcode
              </Button>
            </div>
          )}

          {/* Beacon Placement Mode Indicator */}
          {isStreaming && isPlacingBeacon && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
              <div className="bg-yellow-500/90 text-black px-4 py-2 rounded-lg border-2 border-yellow-400">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Tap to place beacon for {selectedProductForBeacon?.name || 'product'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => {
                shutdownCamera();
                onClose();
              }}
              variant="ghost"
              className="bg-red-500/20 text-white hover:bg-red-500/30 border border-red-500/50"
            >
              <X className="h-5 w-5 mr-2" />
              Close AR
            </Button>
            
            {isStreaming && (
              <div className="flex items-center gap-2">
                {isRetailerMode && !isPlacingBeacon && (
                  <Button
                    onClick={() => {
                      // For retailer mode, allow selecting a product to place beacon
                      const product = nextProduct || (shoppingList.length > 0 ? shoppingList[0] : null);
                      if (product) {
                        setSelectedProductForBeacon(product);
                        setIsPlacingBeacon(true);
                      } else {
                        alert("No product selected. Please select a product first.");
                      }
                    }}
                    variant="ghost"
                    className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/50"
                    size="sm"
                  >
                    <Target className="h-4 w-4 mr-1" />
                    Place Beacon
                  </Button>
                )}
                {isPlacingBeacon && (
                  <Button
                    onClick={() => {
                      setIsPlacingBeacon(false);
                      setSelectedProductForBeacon(null);
                    }}
                    variant="ghost"
                    className="bg-gray-500/20 text-white hover:bg-gray-500/30 border border-gray-500/50"
                    size="sm"
                  >
                    Cancel
                  </Button>
                )}
                <div className="text-white text-xs">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  AR Active
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
