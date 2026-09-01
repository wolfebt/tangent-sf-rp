/**
 * @file fused_vision.wgsl.ts
 * @description Stage 3.3: Line of Sight, soft shadows, and Fog of War compute shader.
 * Executes a fused kernel combining ray-wall intersections with inverse-square
 * light attenuation, writing directly to an ephemeral FBO texture.
 */

export const FUSED_VISION_WGSL = /* wgsl */ `
struct Wall {
  p1: vec2<f32>,
  p2: vec2<f32>,
};

struct LightSource {
  position: vec2<f32>,
  color: vec3<f32>,
  radius: f32,
  intensity: f32,
  _pad: vec3<f32>,
};

struct Uniforms {
  resolution: vec2<f32>,
  num_walls: u32,
  num_lights: u32,
};

// Bind Group 0: Scene Data
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> walls: array<Wall>;
@group(0) @binding(2) var<storage, read> lights: array<LightSource>;

// Bind Group 1: Output Texture (Fog of War Mask / Lighting Buffer)
@group(1) @binding(0) var output_tex: texture_storage_2d<rgba8unorm, write>;

// Calculates the intersection between a ray (origin, direction) and a line segment.
// Returns distance 't' to the intersection, or -1.0 if no intersection occurs.
fn ray_wall_intersect(ro: vec2<f32>, rd: vec2<f32>, p1: vec2<f32>, p2: vec2<f32>) -> f32 {
  let v1 = ro - p1;
  let v2 = p2 - p1;
  let v3 = vec2<f32>(-rd.y, rd.x);

  let dot_v2_v3 = dot(v2, v3);

  // Parallel lines check
  if (abs(dot_v2_v3) < 0.00001) {
    return -1.0;
  }

  let t1 = (v2.x * v1.y - v2.y * v1.x) / dot_v2_v3;
  let t2 = dot(v1, v3) / dot_v2_v3;

  if (t1 > 0.0 && t2 >= 0.0 && t2 <= 1.0) {
    return t1;
  }

  return -1.0;
}

// Approximates soft shadow by tracing a cone toward the light source.
fn calculate_soft_shadow(ro: vec2<f32>, light_pos: vec2<f32>, light_radius: f32) -> f32 {
  let rd = normalize(light_pos - ro);
  let max_dist = length(light_pos - ro);
  var shadow_intensity = 1.0;

  // Hard intersection check first to save cycles
  for (var i = 0u; i < uniforms.num_walls; i = i + 1u) {
    let t = ray_wall_intersect(ro, rd, walls[i].p1, walls[i].p2);
    if (t > 0.0 && t < max_dist) {
      return 0.0; // Hard occlusion (In umbra)
    }
  }

  // Penumbra approximation
  let k = 10.0; // Softness factor
  for (var i = 0u; i < uniforms.num_walls; i = i + 1u) {
    let w = walls[i];
    let pa = w.p1 - ro;
    let pb = w.p2 - ro;
    let t_a = dot(pa, rd);
    let t_b = dot(pb, rd);
    
    if (t_a > 0.0 && t_a < max_dist) {
      let dist_a = length(pa - rd * t_a);
      shadow_intensity = min(shadow_intensity, k * dist_a / t_a);
    }
    if (t_b > 0.0 && t_b < max_dist) {
      let dist_b = length(pb - rd * t_b);
      shadow_intensity = min(shadow_intensity, k * dist_b / t_b);
    }
  }

  return clamp(shadow_intensity, 0.0, 1.0);
}

// 8x8 thread workgroups matching the 2D output texture grid on the Stage
@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let tex_coords = vec2<i32>(i32(global_id.x), i32(global_id.y));
  let f_coords = vec2<f32>(f32(global_id.x), f32(global_id.y));

  // Boundary check
  if (f_coords.x >= uniforms.resolution.x || f_coords.y >= uniforms.resolution.y) {
    return;
  }

  var final_color = vec3<f32>(0.0, 0.0, 0.0);

  // Iterate over all active light sources
  for (var i = 0u; i < uniforms.num_lights; i = i + 1u) {
    let light = lights[i];
    let dist = length(light.position - f_coords);
    
    if (dist > light.radius) {
      continue;
    }
    
    // Inverse square falloff
    let attenuation = 1.0 / (1.0 + (dist * dist * 0.0005));
    let visibility = calculate_soft_shadow(f_coords, light.position, light.radius);
    
    final_color = final_color + (light.color * light.intensity * attenuation * visibility);
  }

  final_color = clamp(final_color, vec3<f32>(0.0), vec3<f32>(1.0));
  textureStore(output_tex, tex_coords, vec4<f32>(final_color, 1.0));
}
`;
