import { describe, it, expect, afterEach } from 'vitest';
import { Container } from 'pixi.js';
import { Stage3DCompositor } from '../Stage3DCompositor';
import { TacticalCameraRig } from '../TacticalCameraRig';
import { Lighting3DManager } from '../lighting/Lighting3DManager';
import { Grid3DOverlay } from '../geometry/Grid3DOverlay';
import { WallExtruder3D } from '../geometry/WallExtruder3D';
import { GridType } from '../../math/CoordinateEngine';
import { HazardParticleSimulator } from '../../physics/HazardParticleSimulator';

describe('Stage 3D GPU Health & Resource Lifecycle', () => {
  let compositor: Stage3DCompositor | null = null;

  afterEach(() => {
    if (compositor) {
      compositor.dispose();
      compositor = null;
    }
  });

  it('preserves shared TokenStandee3D geometries & cached procedural textures across syncTokens while disposing transient resources, and frees everything on dispose()', () => {
    compositor = new Stage3DCompositor();
    const tokenStandees = compositor.tokenStandees as any;

    let baseDisposes = 0;
    let rimDisposes = 0;
    let standeeDisposes = 0;

    const origBaseDispose = tokenStandees.baseGeometry.dispose.bind(tokenStandees.baseGeometry);
    const origRimDispose = tokenStandees.baseRimGeometry.dispose.bind(tokenStandees.baseRimGeometry);
    const origStandeeDispose = tokenStandees.defaultStandeeGeometry.dispose.bind(tokenStandees.defaultStandeeGeometry);

    tokenStandees.baseGeometry.dispose = () => {
      baseDisposes += 1;
      return origBaseDispose();
    };
    tokenStandees.baseRimGeometry.dispose = () => {
      rimDisposes += 1;
      return origRimDispose();
    };
    tokenStandees.defaultStandeeGeometry.dispose = () => {
      standeeDisposes += 1;
      return origStandeeDispose();
    };

    const sampleTokens: any[] = [
      {
        id: 'tok_alpha',
        name: 'Vance',
        x: 100,
        y: 200,
        elevation_ft: 10,
        is_persona: true,
        current_health: 24,
        base_health: 30,
        current_vitality: 18,
        base_vitality: 30
      },
      {
        id: 'tok_beta',
        name: 'Drone',
        x: 350,
        y: 240,
        elevation_ft: 0,
        is_persona: false,
        is_synthetic: true,
        current_structure: 40,
        base_structure: 60
      }
    ];

    compositor.syncTokens(sampleTokens, 'tok_alpha', 'tok_beta');
    const cachedTexturesAfterFirstSync = tokenStandees.tokenTextures.size;
    expect(cachedTexturesAfterFirstSync).toBe(2);

    let transientMaterialDisposes = 0;
    let transientGeometryDisposes = 0;
    (compositor as any).tokensGroup.traverse((obj: any) => {
      if (obj.geometry && !obj.geometry.userData?.shared && typeof obj.geometry.dispose === 'function') {
        const orig = obj.geometry.dispose.bind(obj.geometry);
        obj.geometry.dispose = () => {
          transientGeometryDisposes += 1;
          return orig();
        };
      }
      const mats = obj.material ? (Array.isArray(obj.material) ? obj.material : [obj.material]) : [];
      for (const mat of mats) {
        if (mat && !mat.userData?.shared && typeof mat.dispose === 'function') {
          const origMat = mat.dispose.bind(mat);
          mat.dispose = () => {
            transientMaterialDisposes += 1;
            return origMat();
          };
        }
      }
    });

    compositor.syncTokens(
      sampleTokens.map((t) => (t.id === 'tok_alpha' ? { ...t, x: 180, y: 260 } : t)),
      'tok_alpha',
      'tok_beta'
    );

    expect(tokenStandees.tokenTextures.size).toBe(cachedTexturesAfterFirstSync);
    expect(baseDisposes).toBe(0);
    expect(rimDisposes).toBe(0);
    expect(standeeDisposes).toBe(0);
    expect(transientMaterialDisposes).toBeGreaterThan(0);
    expect(transientGeometryDisposes).toBeGreaterThan(0);

    compositor.dispose();
    expect(tokenStandees.tokenTextures.size).toBe(0);
    expect(baseDisposes).toBe(1);
    expect(rimDisposes).toBe(1);
    expect(standeeDisposes).toBe(1);
    expect(compositor.scene.children.length).toBe(0);
    compositor = null;
  });

  it('updates TacticalCameraRig perspective aspect ratio when updateAspect() is invoked', () => {
    const rig = new TacticalCameraRig({ mode: 'tactical', initialDistance: 800 });
    expect(rig.camera.aspect).toBe(1);

    const aspect = 1920 / 1080;
    rig.updateAspect(aspect);
    expect(rig.camera.aspect).toBeCloseTo(aspect, 6);
  });

  it('preserves shared cached ground texture & shared wall materials across syncFromMap() while disposing transient custom wall materials', () => {
    compositor = new Stage3DCompositor();
    const bgUrl = 'https://example.invalid/sector-grid.png';

    const mapPayload = {
      id: 'map_gpu_resync',
      background_url: bgUrl,
      terrains: [],
      lights: [],
      walls: [
        { id: 'w_solid', type: 'solid', p1: { x: 0, y: 0 }, p2: { x: 100, y: 0 } },
        { id: 'w_custom', type: 'solid', color: '#ff00ff', p1: { x: 100, y: 0 }, p2: { x: 200, y: 0 } }
      ]
    };

    compositor.syncFromMap(mapPayload, []);

    const groundTex = (compositor as any).terrainBuilder.loadedTextures.get(bgUrl);
    expect(groundTex).toBeDefined();
    expect(groundTex.userData?.shared).toBe(true);

    let groundTexDisposes = 0;
    const origGroundTexDispose = groundTex.dispose.bind(groundTex);
    groundTex.dispose = () => {
      groundTexDisposes += 1;
      return origGroundTexDispose();
    };

    let sharedWallMatDisposes = 0;
    const solidMat = (compositor as any).wallExtruder.solidWallMaterial;
    const origSolidMatDispose = solidMat.dispose.bind(solidMat);
    solidMat.dispose = () => {
      sharedWallMatDisposes += 1;
      return origSolidMatDispose();
    };

    let customWallMatDisposes = 0;
    (compositor as any).wallsGroup.traverse((obj: any) => {
      const mats = obj.material ? (Array.isArray(obj.material) ? obj.material : [obj.material]) : [];
      for (const mat of mats) {
        if (mat && !mat.userData?.shared && typeof mat.dispose === 'function') {
          const origMat = mat.dispose.bind(mat);
          mat.dispose = () => {
            customWallMatDisposes += 1;
            return origMat();
          };
        }
      }
    });

    // Second sync must NOT dispose cached ground texture or shared wall material,
    // while disposing the transient custom-colored wall material.
    compositor.syncFromMap(mapPayload, []);
    expect(groundTexDisposes).toBe(0);
    expect(sharedWallMatDisposes).toBe(0);
    expect(customWallMatDisposes).toBeGreaterThan(0);

    compositor.dispose();
    expect(groundTexDisposes).toBe(1);
    expect(sharedWallMatDisposes).toBe(1);
    compositor = null;
  });

  it('Lighting3DManager shares orbGeometry, disposes removed orbMaterials, disposes orbGeometry on dispose(), and resolves atmospheric presets', () => {
    const lm = new Lighting3DManager({ enableShadows: false });
    const sharedOrb = (lm as any).orbGeometry;
    expect(sharedOrb.userData?.shared).toBe(true);

    let orbGeoDisposes = 0;
    const origOrbGeoDispose = sharedOrb.dispose.bind(sharedOrb);
    sharedOrb.dispose = () => {
      orbGeoDisposes += 1;
      return origOrbGeoDispose();
    };

    lm.syncLights([
      { id: 'lt-1', x: 50, y: 60, radius: 180, color: '#f59e0b', intensity: 1, falloff: 'smooth', animation: 'none', animationSpeed: 1, castShadows: false },
      { id: 'lt-2', x: 120, y: 140, radius: 180, color: '#38bdf8', intensity: 1, falloff: 'smooth', animation: 'none', animationSpeed: 1, castShadows: false }
    ]);

    const lt1Entry = (lm as any).pointLightsMap.get('lt-1');
    let lt1OrbMatDisposes = 0;
    const origOrbMatDispose = lt1Entry.orbMaterial.dispose.bind(lt1Entry.orbMaterial);
    lt1Entry.orbMaterial.dispose = () => {
      lt1OrbMatDisposes += 1;
      return origOrbMatDispose();
    };

    // Removing lt-1 must dispose its orbMaterial without disposing shared orbGeometry
    lm.syncLights([
      { id: 'lt-2', x: 120, y: 140, radius: 180, color: '#38bdf8', intensity: 1, falloff: 'smooth', animation: 'none', animationSpeed: 1, castShadows: false }
    ]);
    expect(lt1OrbMatDisposes).toBe(1);
    expect(orbGeoDisposes).toBe(0);

    // Preset & alias atmospheric checks
    lm.setAtmosphere('night_vision');
    expect((lm as any).ambientLight.color.getHex()).toBe(0x10b981);
    lm.setAtmosphere('pitch_black');
    expect((lm as any).ambientLight.color.getHex()).toBe(0x0a0f1d);
    lm.setAtmosphere('dim');
    expect((lm as any).ambientLight.color.getHex()).toBe(0x0f172a);
    lm.setAtmosphere('clear');
    expect((lm as any).ambientLight.color.getHex()).toBe(0x1e293b);

    lm.dispose();
    expect(orbGeoDisposes).toBe(1);
  });

  it('Grid3DOverlay disposes old grid mesh geometry & material on rebuildGrid() and dispose()', () => {
    const grid = new Grid3DOverlay({ gridType: GridType.Square, cellSize: 50, gridExtent: 500 });
    const mesh1 = (grid as any).gridMesh;
    let geo1Disposes = 0;
    let mat1Disposes = 0;
    const origGeo1Dispose = mesh1.geometry.dispose.bind(mesh1.geometry);
    const origMat1Dispose = mesh1.material.dispose.bind(mesh1.material);
    mesh1.geometry.dispose = () => { geo1Disposes += 1; return origGeo1Dispose(); };
    mesh1.material.dispose = () => { mat1Disposes += 1; return origMat1Dispose(); };

    grid.setGridType(GridType.HexFlatTop);
    expect(geo1Disposes).toBe(1);
    expect(mat1Disposes).toBe(1);

    const mesh2 = (grid as any).gridMesh;
    let geo2Disposes = 0;
    let mat2Disposes = 0;
    const origGeo2Dispose = mesh2.geometry.dispose.bind(mesh2.geometry);
    const origMat2Dispose = mesh2.material.dispose.bind(mesh2.material);
    mesh2.geometry.dispose = () => { geo2Disposes += 1; return origGeo2Dispose(); };
    mesh2.material.dispose = () => { mat2Disposes += 1; return origMat2Dispose(); };

    grid.dispose();
    expect(geo2Disposes).toBe(1);
    expect(mat2Disposes).toBe(1);
  });

  it('Stage3DCompositor clears stale lights, syncs atmosphere, and WallExtruder3D tags normalized door/wall userData', () => {
    compositor = new Stage3DCompositor();
    compositor.syncFromMap({
      id: 'm1',
      environmental: { weatherPreset: 'red_alert' },
      lights: [{ id: 'l-a', x: 10, y: 20, radius: 100, color: '#ff0000', intensity: 1 }],
      walls: []
    }, []);
    expect((compositor.lightingManager as any).pointLightsMap.size).toBe(1);

    // Syncing map with empty lights array must clear old lights
    compositor.syncFromMap({ id: 'm1', lights: [], walls: [] }, []);
    expect((compositor.lightingManager as any).pointLightsMap.size).toBe(0);

    const extruder = new WallExtruder3D();
    const grp = extruder.buildWallsGroup([
      { id: 'd-flag', isDoor: true, p1: { x: 0, y: 0 }, p2: { x: 50, y: 0 } },
      { id: 'd-wt', wallType: 'door', p1: { x: 50, y: 0 }, p2: { x: 100, y: 0 } }
    ]);
    expect((grp.children[0] as any).userData.isDoor).toBe(true);
    expect((grp.children[0] as any).userData.wallType).toBe('door');
    expect((grp.children[1] as any).userData.isDoor).toBe(true);
    extruder.dispose();
  });

  it('HazardParticleSimulator reports honest cpu simulationMode and supports idempotent destroy()', () => {
    const sim = new HazardParticleSimulator(new Container(), new Container());
    sim.initializeCompute({ createBuffer: () => ({}) });
    expect(sim.getIsWebGPU()).toBe(false);
    expect(sim.getSimulationMode()).toBe('cpu');
    sim.destroy();
    sim.destroy(); // idempotent
  });
});
