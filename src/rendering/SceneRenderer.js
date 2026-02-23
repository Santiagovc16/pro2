import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class SceneRenderer {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeaf2ff);

    this.camera = new THREE.PerspectiveCamera(58, container.clientWidth / container.clientHeight, 0.1, 300);
    this.camera.position.set(0, 24, 40);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 75;
    this.controls.maxPolarAngle = Math.PI * 0.48;

    this.planetMeshes = new Map();
    this.projectileMeshes = new Map();

    this.camTargetPos = this.camera.position.clone();
    this.camTargetLookAt = new THREE.Vector3(0, 0, 0);

    this.#createBaseScene();
    window.addEventListener("resize", () => this.#onResize());
  }

  #createBaseScene() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(8, 16, 10);
    this.scene.add(key);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2.3, 30, 30),
      new THREE.MeshStandardMaterial({ color: 0xffcb73, emissive: 0xffa940, emissiveIntensity: 0.7 })
    );
    this.scene.add(sun);
  }

  addPlanet(planet) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(planet.size, 32, 32),
      new THREE.MeshStandardMaterial({ color: planet.color, roughness: 0.75 })
    );

    const orbitPts = [...Array(96)].map((_, i) => {
      const a = (i / 96) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * planet.orbitRadius, 0, Math.sin(a) * planet.orbitRadius);
    });
    const orbit = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(orbitPts),
      new THREE.LineBasicMaterial({ color: 0x89a3cb, transparent: true, opacity: 0.6 })
    );

    this.scene.add(mesh, orbit);
    this.planetMeshes.set(planet.id, mesh);
  }

  syncPlanets(gameState) {
    for (const player of gameState.players) {
      const id = player.planet.id;
      const mesh = this.planetMeshes.get(id);
      mesh.position.copy(gameState.getPlanetPosition(id));
    }
  }

  setTurnFocus(gameState) {
    const activeId = gameState.currentPlayer.planet.id;
    const activeMesh = this.planetMeshes.get(activeId);
    if (!activeMesh) return;

    const p = activeMesh.position;
    this.camTargetLookAt.set(p.x, p.y, p.z);
    this.camTargetPos.set(p.x + 9.5, p.y + 6.2, p.z + 11.5);
  }

  syncProjectiles(gameState) {
    for (const shot of gameState.projectiles) {
      if (!this.projectileMeshes.has(shot)) {
        const geometry = this.#buildProjectileGeometry(shot.kind);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: shot.color }));
        this.scene.add(mesh);
        this.projectileMeshes.set(shot, mesh);
      }
      const mesh = this.projectileMeshes.get(shot);
      mesh.position.lerpVectors(shot.start, shot.end, shot.progress);
      mesh.position.y = Math.sin(shot.progress * Math.PI) * shot.arc;
      mesh.rotation.x += 0.08;
      mesh.rotation.y += 0.06;
    }

    for (const [shot, mesh] of this.projectileMeshes.entries()) {
      if (!gameState.projectiles.includes(shot)) {
        this.scene.remove(mesh);
        this.projectileMeshes.delete(shot);
      }
    }
  }

  #buildProjectileGeometry(kind) {
    if (kind === "asteroid") {
      return new THREE.DodecahedronGeometry(0.36, 0);
    }
    return new THREE.ConeGeometry(0.2, 0.7, 10);
  }

  render() {
    this.camera.position.lerp(this.camTargetPos, 0.03);
    this.controls.target.lerp(this.camTargetLookAt, 0.04);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  #onResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
}
