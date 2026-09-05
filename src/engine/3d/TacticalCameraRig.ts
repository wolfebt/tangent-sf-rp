/**
 * @file TacticalCameraRig.ts
 * @description Stage 3D: Dual-mode Tactical Camera Controller for Tangent SF RP.
 * Supports:
 * 1. 'tactical' (Isometric / RTS): Fixed pitch angle, 90° azimuth step snapping (Q/E), pan (WASD or drag), smooth zoom.
 * 2. 'orbit' (Free GM Orbit): Full pitch/yaw rotation around focal point, orbit drag, zoom, and free pan.
 */

import * as THREE from 'three';

export type CameraMode3D = 'tactical' | 'orbit';

export interface CameraRigOptions {
  mode?: CameraMode3D;
  fov?: number;
  near?: number;
  far?: number;
  initialTarget?: THREE.Vector3;
  initialDistance?: number;
}

export class TacticalCameraRig {
  public camera: THREE.PerspectiveCamera;
  private mode: CameraMode3D = 'tactical';
  
  // Focal target (where the camera looks in world space)
  public target: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private desiredTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  // Spherical coordinate system
  private distance: number = 800;
  private desiredDistance: number = 800;
  private minDistance: number = 50;
  private maxDistance: number = 3000;

  // Angles in radians
  // Polar angle (phi): angle from vertical axis (0 = top-down, PI/2 = horizontal ground level)
  private phi: number = Math.PI / 4; // 45 degrees
  private desiredPhi: number = Math.PI / 4;

  // Azimuth angle (theta): horizontal rotation around Y-axis
  private theta: number = Math.PI / 4; // 45 degrees
  private desiredTheta: number = Math.PI / 4;

  // Drag tracking
  private isPointerDown = false;
  private pointerButton = 0; // 0 = left, 1 = middle, 2 = right
  private lastPointerX = 0;
  private lastPointerY = 0;

  // Key state for WASD pan
  private activeKeys: Set<string> = new Set();

  private domElement: HTMLElement | null = null;
  private listenersAttached = false;

  constructor(options: CameraRigOptions = {}) {
    const fov = options.fov || 45;
    const near = options.near || 1;
    const far = options.far || 15000;

    this.camera = new THREE.PerspectiveCamera(fov, 1, near, far);
    this.mode = options.mode || 'tactical';

    if (options.initialTarget) {
      this.target.copy(options.initialTarget);
      this.desiredTarget.copy(options.initialTarget);
    }
    if (options.initialDistance) {
      this.distance = options.initialDistance;
      this.desiredDistance = options.initialDistance;
    }

    if (this.mode === 'tactical') {
      this.desiredPhi = Math.PI / 3; // 60 degrees tactical pitch
      this.phi = this.desiredPhi;
    }

    this.updateCameraTransform();
  }

  public setMode(mode: CameraMode3D) {
    this.mode = mode;
    if (mode === 'tactical') {
      // Snap to crisp tactical angle (60 degrees pitch) and nearest 45-degree azimuth
      this.desiredPhi = Math.PI / 3;
      const step = Math.PI / 4;
      this.desiredTheta = Math.round(this.desiredTheta / step) * step;
    }
  }

  public getMode(): CameraMode3D {
    return this.mode;
  }

  public toggleMode(): CameraMode3D {
    const next = this.mode === 'tactical' ? 'orbit' : 'tactical';
    this.setMode(next);
    return next;
  }

  public attach(domElement: HTMLElement) {
    if (this.listenersAttached) this.detach();
    this.domElement = domElement;

    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    this.domElement.addEventListener('wheel', this.onWheel, { passive: false });
    this.domElement.addEventListener('contextmenu', this.onContextMenu);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.listenersAttached = true;
  }

  public detach() {
    if (!this.domElement) return;

    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.domElement.removeEventListener('wheel', this.onWheel);
    this.domElement.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    this.domElement = null;
    this.listenersAttached = false;
    this.activeKeys.clear();
  }

  public update(delta: number) {
    // Process keyboard pan
    this.handleKeyboardPan(delta);

    // Damped smooth interpolation (lerp)
    const factor = Math.min(1, delta * 12);
    this.distance = THREE.MathUtils.lerp(this.distance, this.desiredDistance, factor);
    this.phi = THREE.MathUtils.lerp(this.phi, this.desiredPhi, factor);
    this.theta = THREE.MathUtils.lerp(this.theta, this.desiredTheta, factor);
    this.target.lerp(this.desiredTarget, factor);

    this.updateCameraTransform();
  }

  /**
   * Snaps or rotates azimuth by 90-degree or 45-degree steps (Tactical camera control)
   */
  public rotateTacticalAzimuth(clockwise: boolean = true) {
    const step = Math.PI / 2; // 90 degrees
    if (clockwise) {
      this.desiredTheta += step;
    } else {
      this.desiredTheta -= step;
    }
  }

  /**
   * Centers the camera on a specific world point (e.g. active token or ping)
   */
  public focusOn(point: { x: number; y: number; z?: number }, distance?: number) {
    this.desiredTarget.set(point.x, point.z ?? 0, point.y);
    if (distance) {
      this.desiredDistance = THREE.MathUtils.clamp(distance, this.minDistance, this.maxDistance);
    }
  }

  public setTopDownView() {
    this.desiredPhi = 0.001; // nearly 0 for top-down orthogonal look
  }

  public setIsometricView() {
    this.desiredPhi = Math.PI / 3; // 60 degrees
    this.desiredTheta = Math.PI / 4;
  }

  public resetView() {
    this.desiredTarget.set(0, 0, 0);
    this.desiredDistance = 800;
    this.setIsometricView();
  }

  private updateCameraTransform() {
    // Convert spherical (distance, phi, theta) to Cartesian (x, y, z)
    // Note in Three.js: Y is UP, X is lateral, Z is depth.
    const sinPhi = Math.sin(this.phi);
    const cosPhi = Math.cos(this.phi);
    const sinTheta = Math.sin(this.theta);
    const cosTheta = Math.cos(this.theta);

    const x = this.target.x + this.distance * sinPhi * sinTheta;
    const y = this.target.y + this.distance * cosPhi;
    const z = this.target.z + this.distance * sinPhi * cosTheta;

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }

  // --- POINTER EVENTS ---

  private onPointerDown = (e: PointerEvent) => {
    // Only capture middle click (1), right click (2), or left click (0) with Alt or Space
    if (e.button === 1 || e.button === 2 || (e.button === 0 && (e.altKey || e.shiftKey))) {
      this.isPointerDown = true;
      this.pointerButton = e.button;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;

    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;

    if (this.pointerButton === 1 || (this.pointerButton === 0 && e.shiftKey)) {
      // Middle-click or Shift+LeftDrag: PAN in camera ground plane
      this.panByPixels(dx, dy);
    } else if (this.pointerButton === 2 || (this.pointerButton === 0 && e.altKey)) {
      // Right-click or Alt+LeftDrag: ROTATE
      if (this.mode === 'orbit') {
        // Free Orbit rotation
        this.desiredTheta -= dx * 0.006;
        this.desiredPhi = THREE.MathUtils.clamp(
          this.desiredPhi - dy * 0.006,
          0.05, // Avoid looking from straight below
          Math.PI / 2 - 0.02 // Don't clip below ground plane
        );
      } else {
        // Tactical mode: Smooth horizontal rotation, fixed pitch
        this.desiredTheta -= dx * 0.006;
      }
    }
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1 + Math.abs(e.deltaY) * 0.0012;
    if (e.deltaY > 0) {
      this.desiredDistance = THREE.MathUtils.clamp(this.desiredDistance * zoomFactor, this.minDistance, this.maxDistance);
    } else {
      this.desiredDistance = THREE.MathUtils.clamp(this.desiredDistance / zoomFactor, this.minDistance, this.maxDistance);
    }
  };

  private onContextMenu = (e: MouseEvent) => {
    // Prevent browser right-click context menu when rotating
    e.preventDefault();
  };

  // --- KEYBOARD NAVIGATION ---

  private onKeyDown = (e: KeyboardEvent) => {
    // Ignore input if user is typing in an input field
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) {
      return;
    }

    const key = e.key.toLowerCase();

    // Step rotations
    if (key === 'q') {
      this.rotateTacticalAzimuth(false);
    } else if (key === 'e') {
      this.rotateTacticalAzimuth(true);
    } else if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      this.activeKeys.add(key);
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.activeKeys.delete(e.key.toLowerCase());
  };

  private handleKeyboardPan(delta: number) {
    if (this.activeKeys.size === 0) return;

    const panSpeed = (this.distance * 0.8) * delta; // Scale pan speed with zoom level

    // Camera forward vector projected onto ground plane (XZ)
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    // Right vector (perpendicular to forward)
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const moveVector = new THREE.Vector3();

    if (this.activeKeys.has('w') || this.activeKeys.has('arrowup')) moveVector.add(forward);
    if (this.activeKeys.has('s') || this.activeKeys.has('arrowdown')) moveVector.sub(forward);
    if (this.activeKeys.has('d') || this.activeKeys.has('arrowright')) moveVector.add(right);
    if (this.activeKeys.has('a') || this.activeKeys.has('arrowleft')) moveVector.sub(right);

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize().multiplyScalar(panSpeed);
      this.desiredTarget.add(moveVector);
    }
  }

  private panByPixels(dx: number, dy: number) {
    // Camera forward and right vectors projected onto ground
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    // Pan scale based on distance and field of view
    const panFactor = (this.distance / 700);
    const move = new THREE.Vector3()
      .addScaledVector(right, -dx * panFactor)
      .addScaledVector(forward, dy * panFactor);

    this.desiredTarget.add(move);
  }

  public updateAspect(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
