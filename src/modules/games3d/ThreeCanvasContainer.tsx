import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { buildThemedBackdrop, SceneTheme } from './modelFactory';

interface ThreeCanvasContainerProps {
  onInit: (
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer
  ) => (() => void) | void;
  theme?: SceneTheme;
  className?: string;
  fallbackNode?: React.ReactNode;
}

export const ThreeCanvasContainer: React.FC<ThreeCanvasContainerProps> = ({
  onInit,
  theme = 'park',
  className = 'w-full h-full min-h-[340px]',
  fallbackNode
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onInitRef = useRef(onInit);
  onInitRef.current = onInit;

  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    setWebglFailed(false);

    let renderer: THREE.WebGLRenderer | null = null;
    let cleanupScene: (() => void) | void;
    let resizeObs: ResizeObserver | null = null;
    let rafResize = 0;
    let timerResize = 0;

    // 1. Scene + Vibrant Gradient Sky & Illustrated Horizon
    const scene = new THREE.Scene();
    const backdrop = buildThemedBackdrop(scene, theme);

    scene.userData.updateBackdrop = (t: number) => {
      backdrop.children.forEach(obj => {
        if (obj.name.startsWith('skyCloud_')) {
          const base = obj.userData.baseX ?? 0;
          const phase = obj.userData.phase ?? 0;
          obj.position.x = base + Math.sin(t * 0.25 + phase) * 0.85;
          obj.position.y += Math.sin(t * 0.9 + phase) * 0.0012;
        }
      });
    };

    // 2. Camera
    const width = Math.max(container.clientWidth || 0, 320);
    const height = Math.max(container.clientHeight || 0, 320);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 9);
    camera.lookAt(0, 1, 0);

    // 3. Safe Renderer creation with WebGL support & context-loss guard
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      const gl = renderer.getContext();
      if (!gl) {
        throw new Error('WebGL context unavailable');
      }
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch {
      setWebglFailed(true);
      return;
    }

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setWebglFailed(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);

    // 4. Warm Outdoor Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xa8d59c, 0.9);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffdf5, 0.82);
    dirLight.position.set(6, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // 5. Scene Setup Callback via stable ref (never tears down WebGL on parent re-renders)
    try {
      cleanupScene = onInitRef.current(scene, camera, renderer);
    } catch {
      setWebglFailed(true);
    }

    // 6. Responsive ResizeObserver + immediate layout sync frames
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    handleResize();
    rafResize = window.requestAnimationFrame(handleResize);
    timerResize = window.setTimeout(handleResize, 120);

    resizeObs = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    if (resizeObs) resizeObs.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(rafResize);
      window.clearTimeout(timerResize);
      window.removeEventListener('resize', handleResize);
      if (resizeObs) resizeObs.disconnect();
      if (cleanupScene) cleanupScene();

      if (renderer) {
        renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }

      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        }
      });
    };
  }, [theme]);

  if (webglFailed) {
    return (
      <div className={`relative overflow-hidden rounded-[24px] ${className}`}>
        {fallbackNode || (
          <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#EBF3FE] via-[#F5F3FC] to-[#E6F9F2] dark:from-[#1E1B3A] dark:to-[#121024]">
            <p className="font-display text-lg font-extrabold text-[#25233A] dark:text-[#F8F7FF]">
              Cenário Interativo Ativo
            </p>
            <p className="text-xs font-medium text-[#77758A] dark:text-[#B8B3D6] mt-1 max-w-sm">
              Este navegador está operando sem aceleração WebGL 3D. Use os botões abaixo para jogar normalmente!
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      style={{ minHeight: '320px' }}
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-b from-[#9AD0EC] via-[#C8E8FA] to-[#BAE29D] ${className}`}
    />
  );
};
