/\* STREAMING\_CHUNK: Defining particle structures and physics uniforms... \*/

// \-----------------------------------------------------------------------------

// @file elemental\_fluid.wgsl

// @description Stage 3.5: Pyro/Corrosive particle physics simulation.

// Executes a Lagrangian particle system, calculating gravity, drag, and SDF

// collision restitution for millions of elements at 60fps.

// \-----------------------------------------------------------------------------

struct Particle {

position: vec2,

velocity: vec2,

life: f32, // Decays over time; 0.0 means dead/ready for respawn

mass: f32,

// 16-byte alignment padding required by WebGPU

\_pad1: f32,

\_pad2: f32,

};

struct PhysicsUniforms {

delta\_time: f32,

restitution: f32, // Bounciness factor (e.g., 0.8 for plasma, 0.2 for acid)

wind\_x: f32,

wind\_y: f32,

gravity\_y: f32,

\_pad: vec3,

};

@group(0) @binding(0) var params: PhysicsUniforms;

@group(0) @binding(1) var\<storage, read\_write\> particles: array;

/\* STREAMING\_CHUNK: Terrain Collision via SDF... \*/

// A mocked Signed Distance Field function representing the map's hard geometry.

// In production, this samples the output of the CSG kernel or a BVH structure.

fn map\_terrain(p: vec2) \-\> f32 {

// Example: A solid floor at Y \= 500

let floor\_dist \= 500.0 \- p.y;

// Example: A pillar at (400, 400\) with radius 50

let pillar\_dist \= length(p \- vec2(400.0, 400.0)) \- 50.0;

return min(floor\_dist, pillar\_dist);

}

// Calculates the surface normal of the SDF geometry by sampling the gradient.

fn calculate\_normal(p: vec2) \-\> vec2 {

let epsilon \= 0.01;

let dx \= map\_terrain(vec2(p.x \+ epsilon, p.y)) \- map\_terrain(vec2(p.x \- epsilon, p.y));

let dy \= map\_terrain(vec2(p.x, p.y \+ epsilon)) \- map\_terrain(vec2(p.x, p.y \- epsilon));

return normalize(vec2(dx, dy));

}

/\* STREAMING\_CHUNK: Main physics integration loop... \*/

@compute @workgroup\_size(256)

fn main(@builtin(global\_invocation\_id) global\_id: vec3) {

let index \= global\_id.x;

// Prevent out-of-bounds execution  
if (index \>= arrayLength(\&particles)) {  
    return;  
}

var p \= particles\[index\];

// Early exit if the particle is dead  
if (p.life \<= 0.0) {  
    return;  
}

// 1\. Calculate External Forces (Gravity & Wind)  
let external\_force \= vec2\<f32\>(params.wind\_x, params.gravity\_y);  
let acceleration \= external\_force / p.mass;

// 2\. Euler Integration for Velocity and Position  
p.velocity \= p.velocity \+ (acceleration \* params.delta\_time);  
var next\_pos \= p.position \+ (p.velocity \* params.delta\_time);

// 3\. Collision Detection against SDF Terrain  
let dist \= map\_terrain(next\_pos);

if (dist \< 0.0) {  
    // Particle has penetrated the geometry.   
    // Calculate the normal of the surface we just hit.  
    let normal \= calculate\_normal(next\_pos);  
      
    // Push the particle out of the wall by the penetration depth  
    next\_pos \= next\_pos \+ (normal \* abs(dist));  
      
    // Calculate the reflection vector (bounce) using the restitution coefficient  
    let dot\_vel\_norm \= dot(p.velocity, normal);  
    p.velocity \= p.velocity \- ((1.0 \+ params.restitution) \* dot\_vel\_norm \* normal);  
      
    // Apply friction to dampen endless bouncing  
    p.velocity \= p.velocity \* 0.98;  
}

// 4\. Finalize State  
p.position \= next\_pos;  
p.life \= p.life \- params.delta\_time;

// Write back to the global storage buffer  
particles\[index\] \= p;

}