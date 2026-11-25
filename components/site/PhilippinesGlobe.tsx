'use client';

import { useEffect, useRef } from 'react';

/** T. De Leon Chapter No. 47 — Ilagan, Isabela. */
const ILAGAN = { lat: 17.148, lon: 121.889 };
/** Point the camera frames: the middle of the archipelago. */
const PH_FOCUS = { lat: 13.8, lon: 122.0 };
/** Camera: altitude above the surface (Earth radii), vertical FOV, and where the horizon sits. */
const ORBIT = { altitude: 0.27, fov: 17, horizonFromTop: 0.24, focusFromTop: 0.6 };
/** Bounds of the high-resolution NASA crop in /images/earth-ph-hires.jpg (degrees). */
const PATCH = { lonMin: 114, lonMax: 130, latMin: 3, latMax: 22 };

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  varying vec3 vPosObj;
  void main() {
    vUv = uv;
    vPosObj = position;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPosW = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const EARTH_FRAGMENT = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uPatch;
  uniform vec3 uSun;
  uniform vec4 uPatchBounds; // lonMin, lonMax, latMin, latMax
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vec3 day = texture2D(uDay, vUv).rgb;

    // Swap in the 500 m NASA crop over the Philippines, feathered at its edges.
    float lon = vUv.x * 360.0 - 180.0;
    float lat = vUv.y * 180.0 - 90.0;
    vec2 pUv = vec2(
      (lon - uPatchBounds.x) / (uPatchBounds.y - uPatchBounds.x),
      (lat - uPatchBounds.z) / (uPatchBounds.w - uPatchBounds.z)
    );
    float inPatch = smoothstep(0.0, 0.05, pUv.x) * smoothstep(1.0, 0.95, pUv.x)
                  * smoothstep(0.0, 0.05, pUv.y) * smoothstep(1.0, 0.95, pUv.y);
    day = mix(day, texture2D(uPatch, clamp(pUv, 0.0, 1.0)).rgb, inPatch);

    vec3 N = normalize(vNormalW);
    vec3 L = normalize(uSun);
    vec3 V = normalize(cameraPosition - vPosW);
    float ndl = dot(N, L);
    float lit = clamp(ndl * 1.1 + 0.05, 0.0, 1.0);

    // Blue Marble oceans are blue-dominant; use that as a water mask for sun glint.
    float ocean = smoothstep(0.02, 0.10, day.b - max(day.r, day.g) * 0.9);
    vec3 H = normalize(L + V);
    float glint = pow(max(dot(N, H), 0.0), 120.0) * 1.8 + pow(max(dot(N, H), 0.0), 14.0) * 0.12;
    glint *= ocean * step(0.0, ndl);

    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 4.0);
    vec3 color = day * (0.025 + lit * 1.25) + vec3(1.0, 0.93, 0.82) * glint;
    color = mix(color, vec3(0.32, 0.58, 1.0) * (0.12 + lit), fresnel * 0.45);

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const CLOUD_FRAGMENT = /* glsl */ `
  uniform vec3 uSun;
  uniform float uTime;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  varying vec3 vPosObj;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = normalize(vPosObj) * 4.2 + vec3(uTime * 0.004, 0.0, uTime * 0.002);
    // Domain warp gives the streaky, swirled look of real cloud decks.
    p += 0.6 * vec3(fbm(p + 3.1), fbm(p + 7.7), fbm(p + 1.3));
    float d = fbm(p);
    float alpha = smoothstep(0.52, 0.8, d) * 0.85;

    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    float lit = clamp(dot(N, normalize(uSun)) * 1.1 + 0.05, 0.0, 1.0);
    alpha *= smoothstep(0.0, 0.25, dot(N, V)); // thin out toward the limb

    gl_FragColor = vec4(vec3(1.0) * (0.04 + lit * 1.05), alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vNormalW;
  void main() {
    vNormalV = normalize(normalMatrix * normal);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 uSun;
  varying vec3 vNormalV;
  varying vec3 vNormalW;
  void main() {
    float rim = pow(clamp(0.78 - dot(vNormalV, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 3.2);
    float day = clamp(dot(normalize(vNormalW), normalize(uSun)) + 0.55, 0.15, 1.0);
    gl_FragColor = vec4(vec3(0.25, 0.55, 1.0) * rim * day * 1.05, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * Low-orbit, NASA-textured 3D Earth framed on the Philippines, with a gold pin on Ilagan.
 * three.js is imported on the client only, after mount, so it stays out of the initial bundle.
 */
export default function PhilippinesGlobe() {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const label = labelRef.current;
    if (!host || !label) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch {
        return; // No WebGL: the window keeps its CSS starfield.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.className = 'absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000';
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      // Camera orbits above a point south of the focus, looking north at the horizon (see placeCamera).
      const camera = new THREE.PerspectiveCamera(ORBIT.fov, 1, 0.005, 20);
      const focusWorld = new THREE.Vector3(0, 1, 0);
      const projected = new THREE.Vector3();
      const placeCamera = () => {
        // Tilt so the horizon sits at ORBIT.horizonFromTop; then solve (bisection) for how far south
        // the camera must hang so the focus point lands at ORBIT.focusFromTop.
        const dip = Math.acos(1 / (1 + ORBIT.altitude));
        const tilt = (0.5 - ORBIT.horizonFromTop) * camera.fov * (Math.PI / 180);
        const aim = (gamma: number) => {
          const u = new THREE.Vector3(0, Math.cos(gamma), Math.sin(gamma));
          const n = new THREE.Vector3(0, Math.sin(gamma), -Math.cos(gamma));
          const horizon = n.clone().multiplyScalar(Math.cos(dip)).addScaledVector(u, -Math.sin(dip));
          const horizonUp = n.clone().multiplyScalar(Math.sin(dip)).addScaledVector(u, Math.cos(dip));
          const forward = horizon.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(horizonUp, -Math.sin(tilt));
          const camUp = horizon.clone().multiplyScalar(Math.sin(tilt)).addScaledVector(horizonUp, Math.cos(tilt));
          camera.position.copy(u).multiplyScalar(1 + ORBIT.altitude);
          camera.up.copy(camUp);
          camera.lookAt(camera.position.clone().add(forward));
          camera.updateMatrixWorld();
          return projected.copy(focusWorld).project(camera).y; // NDC: +1 top, -1 bottom
        };
        const target = 1 - 2 * ORBIT.focusFromTop;
        let lo = 0;
        let hi = 0.6;
        for (let i = 0; i < 40; i++) {
          const mid = (lo + hi) / 2;
          // Moving the camera further south pushes the focus point up the frame.
          if (aim(mid) < target) lo = mid;
          else hi = mid;
        }
        aim((lo + hi) / 2);
      };

      const toVec = (lat: number, lon: number, r = 1) => {
        const phi = ((lon + 180) * Math.PI) / 180;
        const theta = ((90 - lat) * Math.PI) / 180;
        return new THREE.Vector3(
          -r * Math.cos(phi) * Math.sin(theta),
          r * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta)
        );
      };

      // Turn the globe so the focus point is straight up (+y) with north pointing away (-z), east to +x.
      const up = toVec(PH_FOCUS.lat, PH_FOCUS.lon);
      const north = toVec(PH_FOCUS.lat + 0.01, PH_FOCUS.lon).sub(up).normalize();
      const east = toVec(PH_FOCUS.lat, PH_FOCUS.lon + 0.01).sub(up).normalize();
      const basis = new THREE.Matrix4().makeBasis(east, up, north.clone().negate());
      const baseTilt = new THREE.Quaternion().setFromRotationMatrix(basis).invert();
      const globe = new THREE.Group();
      globe.quaternion.copy(baseTilt);
      scene.add(globe);

      const sun = new THREE.Vector3(-0.55, 0.8, 0.45).normalize();
      const loader = new THREE.TextureLoader();
      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      const loadTexture = (src: string) =>
        new Promise<InstanceType<typeof THREE.Texture>>((resolve, reject) =>
          loader.load(
            src,
            (t) => {
              t.colorSpace = THREE.SRGBColorSpace;
              t.anisotropy = maxAniso;
              resolve(t);
            },
            undefined,
            reject
          )
        );

      let day: InstanceType<typeof THREE.Texture>;
      let patch: InstanceType<typeof THREE.Texture>;
      try {
        [day, patch] = await Promise.all([
          loadTexture('/images/earth-bluemarble.jpg'),
          loadTexture('/images/earth-ph-hires.jpg'),
        ]);
      } catch {
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      if (disposed) {
        day.dispose();
        patch.dispose();
        renderer.dispose();
        return;
      }
      patch.wrapS = patch.wrapT = THREE.ClampToEdgeWrapping;

      const earthGeo = new THREE.SphereGeometry(1, 192, 192);
      const earthMat = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: EARTH_FRAGMENT,
        uniforms: {
          uDay: { value: day },
          uPatch: { value: patch },
          uSun: { value: sun },
          uPatchBounds: { value: new THREE.Vector4(PATCH.lonMin, PATCH.lonMax, PATCH.latMin, PATCH.latMax) },
        },
      });
      globe.add(new THREE.Mesh(earthGeo, earthMat));

      const cloudGeo = new THREE.SphereGeometry(1.006, 160, 160);
      const cloudMat = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: CLOUD_FRAGMENT,
        uniforms: { uSun: { value: sun }, uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
      });
      const clouds = new THREE.Mesh(cloudGeo, cloudMat);
      globe.add(clouds);

      const atmoGeo = new THREE.SphereGeometry(1.016, 160, 160);
      const atmoMat = new THREE.ShaderMaterial({
        vertexShader: ATMOSPHERE_VERTEX,
        fragmentShader: ATMOSPHERE_FRAGMENT,
        uniforms: { uSun: { value: sun } },
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      });
      scene.add(new THREE.Mesh(atmoGeo, atmoMat));

      // Ilagan pin: glowing dot, short light beam, and a pulsing ring, all on the surface normal.
      const pinPos = toVec(ILAGAN.lat, ILAGAN.lon, 1.0015);
      const pinNormal = pinPos.clone().normalize();
      const gold = new THREE.Color('#f3d27a');
      const pin = new THREE.Group();
      pin.position.copy(pinPos);
      pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pinNormal);
      globe.add(pin);

      const dotGeo = new THREE.SphereGeometry(0.0042, 24, 24);
      const dotMat = new THREE.MeshBasicMaterial({ color: gold, toneMapped: false });
      pin.add(new THREE.Mesh(dotGeo, dotMat));

      const beamGeo = new THREE.CylinderGeometry(0.0005, 0.0005, 0.022, 12);
      beamGeo.rotateX(Math.PI / 2);
      beamGeo.translate(0, 0, 0.011);
      const beamMat = new THREE.MeshBasicMaterial({
        color: gold,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      });
      pin.add(new THREE.Mesh(beamGeo, beamMat));

      const ringGeo = new THREE.RingGeometry(0.006, 0.0078, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: gold,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      pin.add(ring);

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = host;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        placeCamera();
      };
      resize();

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const spin = new THREE.Quaternion();
      const polar = new THREE.Vector3(0, 1, 0);
      const labelPos = new THREE.Vector3();
      const start = performance.now();
      let frame = 0;
      let visible = false;

      const render = () => {
        const t = reduceMotion ? 0 : (performance.now() - start) / 1000;
        // Slow sway around the polar axis (±2.5° of longitude) so the archipelago drifts gently.
        spin.setFromAxisAngle(polar, Math.sin(t * 0.09) * 0.044);
        globe.quaternion.copy(baseTilt).multiply(spin);
        clouds.rotation.y = t * 0.0035;
        cloudMat.uniforms.uTime.value = t;

        const pulse = (t * 0.55) % 1;
        ring.scale.setScalar(1 + pulse * 3.2);
        ringMat.opacity = (1 - pulse) * 0.9;

        renderer.render(scene, camera);

        pin.getWorldPosition(labelPos);
        labelPos.project(camera);
        label.style.transform = `translate(${((labelPos.x + 1) / 2) * host.clientWidth}px, ${
          ((1 - labelPos.y) / 2) * host.clientHeight
        }px)`;
        label.style.opacity = '1';
      };

      const loop = () => {
        render();
        if (visible && !reduceMotion) frame = requestAnimationFrame(loop);
      };

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(frame);
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
        [earthGeo, cloudGeo, atmoGeo, dotGeo, beamGeo, ringGeo].forEach((g) => g.dispose());
        [earthMat, cloudMat, atmoMat, dotMat, beamMat, ringMat].forEach((m) => m.dispose());
        day.dispose();
        patch.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={hostRef} className="absolute inset-0">
      <div
        ref={labelRef}
        className="pointer-events-none absolute left-0 top-0 z-10 opacity-0 transition-opacity duration-700"
        aria-hidden
      >
        <div className="-translate-y-[130%] translate-x-3 whitespace-nowrap rounded-full border border-gold/40 bg-black/55 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-gold backdrop-blur-md md:text-[0.68rem]">
          Ilagan, Isabela
        </div>
      </div>
    </div>
  );
}
