/**
 * @file sdf_csg_core.wgsl.ts
 * @description Stage 3.4: Dynamic environment geometry and boolean math.
 * Contains mathematical library for Signed Distance Fields (SDFs) and
 * Constructive Solid Geometry (CSG), allowing infinite-scaling architecture.
 */

export const SDF_CSG_CORE_WGSL = /* wgsl */ `
// Sphere SDF: shortest distance from point 'p' to a sphere of radius 'r'
fn sdSphere(p: vec3<f32>, r: f32) -> f32 {
  return length(p) - r;
}

// Box SDF: 'b' is a vec3 denoting half-extents (width/2, height/2, depth/2)
fn sdBox(p: vec3<f32>, b: vec3<f32>) -> f32 {
  let d = abs(p) - b;
  return length(max(d, vec3<f32>(0.0))) + min(max(d.x, max(d.y, d.z)), 0.0);
}

// Cylinder SDF: 'h' contains (radius, height)
fn sdCylinder(p: vec3<f32>, h: vec2<f32>) -> f32 {
  let d = abs(vec2<f32>(length(p.xz), p.y)) - h;
  return min(max(d.x, d.y), 0.0) + length(max(d, vec2<f32>(0.0)));
}

// CSG Union: Merges two SDF shapes
fn opUnion(d1: f32, d2: f32) -> f32 {
  return min(d1, d2);
}

// CSG Subtraction: Carves d1 out of d2 (e.g. carving a doorway out of a bulkhead)
fn opSubtract(d1: f32, d2: f32) -> f32 {
  return max(-d1, d2);
}

// CSG Intersection: Returns only overlapping volume of d1 and d2
fn opIntersect(d1: f32, d2: f32) -> f32 {
  return max(d1, d2);
}

// Polynomial Smooth Minimum (smin): organic melting blend between two shapes
fn opSmoothUnion(d1: f32, d2: f32, k: f32) -> f32 {
  let h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

// Domain Repetition: folds space to create repeating patterns (e.g. pillars, corridor ribs)
fn opRep(p: vec3<f32>, c: vec3<f32>) -> vec3<f32> {
  let half_c = c * 0.5;
  let modulo_p = p - c * floor(p / c);
  return modulo_p - half_c;
}

// Analytical Normal Calculation
fn calcNormal(p: vec3<f32>, mapFn: fn(vec3<f32>) -> f32) -> vec3<f32> {
  let e = 0.001;
  let dx = mapFn(p + vec3<f32>(e, 0.0, 0.0)) - mapFn(p - vec3<f32>(e, 0.0, 0.0));
  let dy = mapFn(p + vec3<f32>(0.0, e, 0.0)) - mapFn(p - vec3<f32>(0.0, e, 0.0));
  let dz = mapFn(p + vec3<f32>(0.0, 0.0, e)) - mapFn(p - vec3<f32>(0.0, 0.0, e));
  return normalize(vec3<f32>(dx, dy, dz));
}
`;
