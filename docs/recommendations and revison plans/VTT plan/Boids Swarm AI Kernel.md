/\* STREAMING\_CHUNK: Swarm intelligence data structures... \*/

// \-----------------------------------------------------------------------------

// @file boids\_swarm.wgsl

// @description Stage 3.6: Swarm intelligence and emergent flocking behavior.

// Executes the Boids algorithm (Alignment, Cohesion, Separation) across thousands

// of autonomous entities (e.g., Nano-swarms, Tyranid-style bestial hordes).

// \-----------------------------------------------------------------------------

struct Boid {

position: vec2,

velocity: vec2,

};

struct SwarmParams {

delta\_time: f32,

rule1\_scale: f32, // Cohesion weight

rule2\_scale: f32, // Separation weight

rule3\_scale: f32, // Alignment weight

perception\_radius: f32,

max\_speed: f32,

};

@group(0) @binding(0) var params: SwarmParams;

@group(0) @binding(1) var\<storage, read\> boids\_in: array;

@group(0) @binding(2) var\<storage, read\_write\> boids\_out: array;

/\* STREAMING\_CHUNK: Main emergent behavior evaluation loop... \*/

@compute @workgroup\_size(64)

fn main(@builtin(global\_invocation\_id) global\_id: vec3) {

let index \= global\_id.x;

let total\_boids \= arrayLength(\&boids\_in);

if (index \>= total\_boids) { return; }

let current\_boid \= boids\_in\[index\];

var center\_of\_mass \= vec2\<f32\>(0.0, 0.0);  
var separation\_heading \= vec2\<f32\>(0.0, 0.0);  
var average\_velocity \= vec2\<f32\>(0.0, 0.0);  
var neighbors\_count: u32 \= 0u;

// OPTIMIZATION NOTE: In a true production environment with 10,000+ boids,   
// an O(N^2) loop is too slow even for GPUs. We would implement a Spatial   
// Grid Hashing algorithm here, only iterating through boids in adjacent grid cells.  
// For this blueprint, we use a naive loop to demonstrate the mathematical rules.  
for (var i \= 0u; i \< total\_boids; i \= i \+ 1u) {  
    if (i \== index) { continue; }  
      
    let other\_boid \= boids\_in\[i\];  
    let dist \= distance(current\_boid.position, other\_boid.position);  
      
    if (dist \< params.perception\_radius) {  
        center\_of\_mass \= center\_of\_mass \+ other\_boid.position;  
        average\_velocity \= average\_velocity \+ other\_boid.velocity;  
          
        // If they are too close, calculate a repulsion vector  
        if (dist \< (params.perception\_radius \* 0.3)) {  
            separation\_heading \= separation\_heading \- (other\_boid.position \- current\_boid.position);  
        }  
          
        neighbors\_count \= neighbors\_count \+ 1u;  
    }  
}

var new\_velocity \= current\_boid.velocity;

if (neighbors\_count \> 0u) {  
    let f\_neighbors \= f32(neighbors\_count);  
      
    // Rule 1: Cohesion (Steer toward center of mass of neighbors)  
    center\_of\_mass \= (center\_of\_mass / f\_neighbors) \- current\_boid.position;  
      
    // Rule 2: Separation (Steer away from crowded neighbors)  
    // (separation\_heading is already calculated)  
      
    // Rule 3: Alignment (Steer towards average heading of neighbors)  
    average\_velocity \= (average\_velocity / f\_neighbors) \- current\_boid.velocity;  
      
    // Apply the weighted vectors to the current velocity  
    new\_velocity \= new\_velocity \+ (center\_of\_mass \* params.rule1\_scale)  
                                \+ (separation\_heading \* params.rule2\_scale)  
                                \+ (average\_velocity \* params.rule3\_scale);  
}

// Clamp the velocity to the maximum allowed speed for this swarm type  
let speed \= length(new\_velocity);  
if (speed \> params.max\_speed) {  
    new\_velocity \= normalize(new\_velocity) \* params.max\_speed;  
}

// Euler Integration: Update position based on final velocity  
let new\_position \= current\_boid.position \+ (new\_velocity \* params.delta\_time);

// Write the evaluated state to the ping-pong output buffer to avoid race conditions  
boids\_out\[index\].position \= new\_position;  
boids\_out\[index\].velocity \= new\_velocity;

}