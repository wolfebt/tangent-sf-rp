/**
 * @file elemental_fluid.wgsl.ts
 * @description Stage 3.5: Pyro/Corrosive/Radiation hazard particle physics simulation.
 * Executes a Lagrangian particle system calculating gravity, wind, and SDF
 * collision restitution for environmental hazards on the Stage.
 */

export const ELEMENTAL_FLUID_WGSL = /* wgsl */ `
struct Particle {
  position: vec2<f32>,
  velocity: vec2<f32>,
  life: f32, // Decays over time; 0.0 means dead/ready for respawn
  mass: f32,
  _pad1: f32,
  _pad2: f32,
};

struct PhysicsUniforms {
  delta_time: f32,
  restitution: f32, // Bounciness factor (e.g., 0.8 for plasma, 0.2 for corrosive acid)
  wind_x: f32,
  wind_y: f32,
  gravity_y: f32,
  _pad: vec3<f32>,
};

@group(0) @binding(0) var<uniform> params: PhysicsUniforms;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;

// Terrain SDF collision boundary
fn map_terrain(p: vec2<f32>) -> f32 {
  // Example: baseline collision boundary; overridden dynamically by map bounds
  let floor_dist = 5000.0 - p.y;
  return floor_dist;
}

// Surface normal calculation via gradient sampling
fn calculate_normal(p: vec2<f32>) -> vec2<f32> {
  let epsilon = 0.01;
  let dx = map_terrain(vec2<f32>(p.x + epsilon, p.y)) - map_terrain(vec2<f32>(p.x - epsilon, p.y));
  let dy = map_terrain(vec2<f32>(p.x, p.y + epsilon)) - map_terrain(vec2<f32>(p.x, p.y - epsilon));
  return normalize(vec2<f32>(dx, dy));
}

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;

  if (index >= arrayLength(&particles)) {
    return;
  }

  var p = particles[index];

  if (p.life <= 0.0) {
    return;
  }

  // 1. Calculate External Forces (Gravity & Wind)
  let external_force = vec2<f32>(params.wind_x, params.gravity_y);
  let acceleration = external_force / max(0.001, p.mass);

  // 2. Euler Integration for Velocity and Position
  p.velocity = p.velocity + (acceleration * params.delta_time);
  var next_pos = p.position + (p.velocity * params.delta_time);

  // 3. Collision Detection against SDF Terrain
  let dist = map_terrain(next_pos);

  if (dist < 0.0) {
    let normal = calculate_normal(next_pos);
    next_pos = next_pos + (normal * abs(dist));
    
    let dot_vel_norm = dot(p.velocity, normal);
    p.velocity = p.velocity - ((1.0 + params.restitution) * dot_vel_norm * normal);
    p.velocity = p.velocity * 0.98; // Damping
  }

  // 4. Finalize State
  p.position = next_pos;
  p.life = p.life - params.delta_time;

  particles[index] = p;
}
`;
