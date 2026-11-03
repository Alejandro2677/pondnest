import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

/**
 * Detailed prototype, reconstructed from user-provided and AI-generated Gamegaga R36 HD references.
 * The actual internal components, ports and dimensions are unverified.
 * Front/rear reference images are texture-projected and side geometry approximate.
 * This file deliberately loads named GLB parts, so a faithful GLB can replace
 * the procedural approximation without redesigning the homepage/scroll code.
 */
const MODEL_URL = "/models/gamegaga-r36hd-detailed.glb";

function ConsoleModel({ poseRef, onReady, onProgress }) {
  const { scene } = useLoader(GLTFLoader, MODEL_URL, undefined, (event) => {
    onProgress?.(
      event.lengthComputable
        ? Math.round((event.loaded / event.total) * 100)
        : null,
    );
  });
  const { size } = useThree();
  const root = useRef();
  const front = useRef();
  const back = useRef();
  const triggers = useRef();
  const screen = useRef();
  const controls = useRef();
  const circuit = useRef();

  const groups = useMemo(() => {
    const items = {
      front: [],
      back: [],
      triggers: [],
      screen: [],
      controls: [],
      circuit: [],
    };
    scene.updateMatrixWorld(true);
    scene.traverse((object) => {
      if (!object.isMesh) return;
      const mesh = object.clone(false);
      // Three's GLB loader may introduce parent transform nodes; retain the
      // full object-to-world transform when regrouping the individual meshes.
      object.matrixWorld.decompose(mesh.position, mesh.quaternion, mesh.scale);
      if (mesh.material?.transparent) {
        mesh.material = mesh.material.clone();
        mesh.material.depthWrite = false;
        mesh.material.side = THREE.DoubleSide;
      }
      const name = mesh.name;
      if (name.startsWith("back_trigger")) items.triggers.push(mesh);
      else if (name.startsWith("back_")) items.back.push(mesh);
      else if (name.startsWith("screen_")) items.screen.push(mesh);
      else if (name.startsWith("controls_")) items.controls.push(mesh);
      else if (name.startsWith("middle_") || name.startsWith("body_inner_"))
        items.circuit.push(mesh);
      else items.front.push(mesh);
    });
    return items;
  }, [scene]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useFrame(() => {
    const { rotation, opened, controlsFocus, backHighlight } = poseRef.current;
    const small = size.width <= 700;
    // Give the separated layers room below the existing mobile copy/CTA.
    const targetScale = small ? 1.02 * (1 - opened * 0.18) : 0.9;
    if (root.current) {
      root.current.rotation.set(0.055, rotation, 0);
      root.current.position.set(
        small ? 0 : size.width < 1000 ? 0.95 : 1.65,
        small ? -0.2 - opened * 0.45 : 0.03,
        0,
      );
      root.current.scale.setScalar(targetScale);
    }
    if (front.current) {
      front.current.position.set(-opened * 0.14, 0, opened * 0.42);
    }
    if (back.current) {
      back.current.position.set(opened * 0.3, 0, -opened * 0.64);
    }
    if (screen.current) {
      screen.current.position.set(0, opened * 0.12, opened * 0.87);
    }
    if (controls.current) {
      controls.current.position.set(
        0,
        -opened * 0.2,
        opened * 0.66 + controlsFocus * 0.19,
      );
    }
    if (circuit.current) circuit.current.position.set(0, 0, opened * 0.08);
    if (triggers.current) {
      triggers.current.position.set(
        0,
        0,
        -opened * 0.57 - backHighlight * 0.17,
      );
    }
  });

  return (
    <group ref={root} name="pondnest-console">
      <group ref={back} name="console-back">
        {groups.back.map((mesh) => (
          <primitive key={mesh.name} object={mesh} />
        ))}
      </group>
      <group ref={circuit} name="console-middle">
        {groups.circuit.map((mesh) => (
          <primitive key={mesh.name} object={mesh} />
        ))}
      </group>
      <group ref={front} name="console-front">
        {groups.front.map((mesh) => (
          <primitive key={mesh.name} object={mesh} />
        ))}
      </group>
      <group ref={screen} name="console-screen">
        {groups.screen.map((mesh) => (
          <primitive key={mesh.name} object={mesh} />
        ))}
      </group>
      <group ref={controls} name="console-controls">
        {groups.controls.map((mesh) => (
          <primitive key={mesh.name} object={mesh} />
        ))}
      </group>
      <group ref={triggers} name="console-triggers">
        {groups.triggers.map((mesh) => (
          <primitive key={mesh.name} object={mesh} />
        ))}
      </group>
    </group>
  );
}

export default function Console3D({
  poseRef,
  onReady,
  onError,
  onProgress,
  active,
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      fallback={
        <span>La vista 3D requiere WebGL. Puedes explorar el catálogo.</span>
      }
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", onError, {
          once: true,
        });
      }}
      camera={{ position: [0, 0, 8.6], fov: 36, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "default" }}
    >
      <ambientLight intensity={1.7} />
      <directionalLight
        position={[3.5, 6, 6]}
        intensity={2.3}
        color="#fffafc"
      />
      <directionalLight position={[-4, 1, -6]} intensity={2} color="#c2aaff" />
      <pointLight
        position={[-3, 0.5, 3]}
        intensity={23}
        distance={10}
        color="#8c60df"
      />
      <pointLight
        position={[3, -1, -3]}
        intensity={19}
        distance={10}
        color="#d9a5ff"
      />
      <Suspense fallback={null}>
        <ConsoleModel
          poseRef={poseRef}
          onReady={onReady}
          onProgress={onProgress}
        />
      </Suspense>
    </Canvas>
  );
}
