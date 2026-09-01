/**
 * @file boids_swarm.wgsl.ts
 * @description Stage 3.6: Swarm intelligence and emergent flocking behavior.
 * Executes the Boids algorithm (Alignment, Cohesion, Separation) across thousands
 * of autonomous entities on the Stage (e.g., Nano-swarms, Tyranid-style hordes).
 */

export const BOIDS_SWARM_WGSL = /* wgsl */ `
struct Boid {
  position: vec2<f32>,
  velocity: vec2<f32>,
};

struct SwarmParams {
  delta_time: f32,
  rule1_scale: f32, // Cohesion weight
  rule2_scale: f32, // Separation weight
  rule3_scale: f32, // Alignment weight
  perception_radius: f32,
  max_speed: f32,
  _pad: vec2<f32>,
};

@group(0) @binding(0) var<uniform> params: SwarmParams;
@group(0) @binding(1) var<storage, read> boids_in: array<Boid>;
@group(0) @binding(2) var<storage, read_write> boids_out: array<Boid>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;
  let total_boids = arrayLength(&boids_in);

  if (index >= total_boids) { 
    return; 
  }

  let current_boid = boids_in[index];

  var center_of_mass = vec2<f32>(0.0, 0.0);  
  var separation_heading = vec2<f32>(0.0, 0.0);  
  var average_velocity = vec2<f32>(0.0, 0.0);  
  var neighbors_count: u32 = 0u;

  for (var i = 0u; i < total_boids; i = i + 1u) {  
    if (i == index) { 
      continue; 
    }  
      
    let other_boid = boids_in[i];  
    let dist = distance(current_boid.position, other_boid.position);  
      
    if (dist < params.perception_radius) {  
      center_of_mass = center_of_mass + other_boid.position;  
      average_velocity = average_velocity + other_boid.velocity;  
        
      if (dist < (params.perception_radius * 0.3)) {  
        separation_heading = separation_heading - (other_boid.position - current_boid.position);  
      }  
        
      neighbors_count = neighbors_count + 1u;  
    }  
  }

  var new_velocity = current_boid.velocity;

  if (neighbors_count > 0u) {  
    let f_neighbors = f32(neighbors_count);  
      
    // Rule 1: Cohesion
    center_of_mass = (center_of_mass / f_neighbors) - current_boid.position;  
      
    // Rule 3: Alignment
    average_velocity = (average_velocity / f_neighbors) - current_boid.velocity;  
      
    new_velocity = new_velocity + (center_of_mass * params.rule1_scale)  
                                + (separation_heading * params.rule2_scale)  
                                + (average_velocity * params.rule3_scale);  
  }

  // Velocity clamp
  let speed = length(new_velocity);  
  if (speed > params.max_speed) {  
    new_velocity = normalize(new_velocity) * params.max_speed;  
  }

  // Euler Integration
  let new_position = current_boid.position + (new_velocity * params.delta_time);

  // Write to ping-pong output buffer
  boids_out[index].position = new_position;  
  boids_out[index].velocity = new_velocity;
}
`;
