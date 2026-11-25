'use client';

import { useEffect, useRef } from 'react';

/** Candle GLB: Blender export with an emissive flame mesh and its flicker animation built in. */
const CANDLE_GLB = '/models/candle.glb';
/** Flame tip height in model units (bounds: wax 0–0.16, flame up to ~0.2). */
const FLAME_Y = 0.17;
/** Flame mesh brightness (the file sets 16, which clips to white) and the warm point light's strength. */
const FLAME_EMISSIVE = 2.2;
const FLAME_LIGHT = 0.06;

/**
 * Realistic 3D candle rendered with three.js into a transparent canvas that fills its parent.
 * Plays the model's own flame animation and adds a flickering warm point light at the wick.
 * three.js and the loader are imported on the client only, after mount.
 */
export default function CandleModel() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [THREE, { GLTFLoader }] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
      ]);
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // No WebGL: the stage keeps its CSS candle glow.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.className = 'h-full w-full opacity-0 transition-opacity duration-700';
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 10);

      scene.add(new THREE.AmbientLight(0xffe2c4, 0.35));
      const fill = new THREE.DirectionalLight(0xffd2a8, 0.6);
      fill.position.set(-0.4, 0.5, 0.6);
      scene.add(fill);
      // The model is ~16 cm tall, so the flame light is small and falls off gently (decay 1).
      const flameLight = new THREE.PointLight(0xffa45c, FLAME_LIGHT, 0.6, 1);
      flameLight.position.set(0, FLAME_Y + 0.02, 0.02);
      scene.add(flameLight);

      let gltf: Awaited<ReturnType<InstanceType<typeof GLTFLoader>['loadAsync']>>;
      try {
        gltf = await new GLTFLoader().loadAsync(CANDLE_GLB);
      } catch {
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      if (disposed) {
        renderer.dispose();
        return;
      }
      scene.add(gltf.scene);
      // Transmissive wax renders the transparent canvas behind it as white, so keep the wax opaque;
      // and the flame's 16x emissive strength burns out to white under tone mapping, so tame it.
      gltf.scene.traverse((obj) => {
        const mesh = obj as InstanceType<typeof THREE.Mesh>;
        if (!mesh.isMesh) return;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((m) => {
          const pm = m as InstanceType<typeof THREE.MeshPhysicalMaterial>;
          if ('transmission' in pm && pm.transmission > 0) pm.transmission = 0;
          if (m.name === 'Candle_Light_Emitt' && 'emissiveIntensity' in pm) pm.emissiveIntensity = FLAME_EMISSIVE;
        });
      });
      const bounds = new THREE.Box3().setFromObject(gltf.scene);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());

      const mixer = new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = host;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        // Fit the whole candle (with margin), seen from slightly above like the carousel's tilt.
        const halfFov = (camera.fov * Math.PI) / 360;
        const distance =
          Math.max(size.y / 2 / Math.tan(halfFov), size.x / 2 / (Math.tan(halfFov) * camera.aspect)) * 1.12 +
          size.z / 2;
        const elevation = (12 * Math.PI) / 180;
        camera.position.set(center.x, center.y + Math.sin(elevation) * distance, center.z + Math.cos(elevation) * distance);
        camera.lookAt(center);
      };
      resize();

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const clock = new THREE.Clock();
      let frame = 0;
      let visible = false;

      const render = () => {
        const dt = clock.getDelta();
        const t = clock.elapsedTime;
        if (!reduceMotion) {
          mixer.update(dt);
          // Layered sines read as an irregular candle flicker.
          const flicker = 1 + Math.sin(t * 11.3) * 0.12 + Math.sin(t * 23.7) * 0.07 + Math.sin(t * 3.1) * 0.08;
          flameLight.intensity = FLAME_LIGHT * flicker;
        }
        renderer.render(scene, camera);
      };
      const loop = () => {
        render();
        if (visible && !reduceMotion) frame = requestAnimationFrame(loop);
      };

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(frame);
        clock.getDelta(); // don't jump the animation after being off-screen
        if (visible) loop();
      });
      io.observe(host);
      const ro = new ResizeObserver(() => {
        resize();
        render();
      });
      ro.observe(host);

      render();
      renderer.domElement.style.opacity = '1';

      cleanup = () => {
        cancelAnimationFrame(frame);
        io.disconnect();
        ro.disconnect();
        mixer.stopAllAction();
        gltf.scene.traverse((obj) => {
          const mesh = obj as InstanceType<typeof THREE.Mesh>;
          if (!mesh.isMesh) return;
          mesh.geometry.dispose();
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((m) => {
            Object.values(m).forEach((v) => {
              if (v instanceof THREE.Texture) v.dispose();
            });
            m.dispose();
          });
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}
