/\* STREAMING\_CHUNK: Defining data structs and uniform bindings... \*/

// \-----------------------------------------------------------------------------

// @file fused\_vision.wgsl

// @description Stage 3.3: Line of Sight, soft shadows, and Fog of War rendering.

// Executes a fused kernel combining ray-wall intersections with inverse-square

// light attenuation, writing directly to an ephemeral FBO texture.

// \-----------------------------------------------------------------------------

struct Wall {

p1: vec2,

p2: vec2,

};

struct LightSource {

position: vec2,

color: vec3,

radius: f32,

intensity: f32,

};

struct Uniforms {

resolution: vec2,

num\_walls: u32,

num\_lights: u32,

};

// Bind Group 0: Scene Data

@group(0) @binding(0) var uniforms: Uniforms;

@group(0) @binding(1) var\<storage, read\> walls: array;

@group(0) @binding(2) var\<storage, read\> lights: array;

// Bind Group 1: Output Texture (Fog of War Mask / Lighting Buffer)

@group(1) @binding(0) var output\_tex: texture\_storage\_2d\<rgba8unorm, write\>;

/\* STREAMING\_CHUNK: Implementing 2D ray-segment intersection math... \*/

// Calculates the intersection between a ray (origin, direction) and a line segment

// Returns the distance 't' to the intersection, or \-1.0 if no intersection occurs.

fn ray\_wall\_intersect(ro: vec2, rd: vec2, p1: vec2, p2: vec2) \-\> f32 {

let v1 \= ro \- p1;

let v2 \= p2 \- p1;

let v3 \= vec2(-rd.y, rd.x);

let dot\_v2\_v3 \= dot(v2, v3);

// Parallel lines check  
if (abs(dot\_v2\_v3) \< 0.00001) {  
    return \-1.0;  
}

let t1 \= (v2.x \* v1.y \- v2.y \* v1.x) / dot\_v2\_v3;  
let t2 \= dot(v1, v3) / dot\_v2\_v3;

// Intersects if t1 (ray distance) is positive and t2 (segment parameter) is between 0 and 1  
if (t1 \> 0.0 && t2 \>= 0.0 && t2 \<= 1.0) {  
    return t1;  
}

return \-1.0;

}

/\* STREAMING\_CHUNK: Implementing cone tracing for soft shadow penumbras... \*/

// Approximates a soft shadow by tracing a "cone" towards the light source.

// It finds the closest pass to any wall endpoint without hitting the wall directly.

fn calculate\_soft\_shadow(ro: vec2, light\_pos: vec2, light\_radius: f32) \-\> f32 {

let rd \= normalize(light\_pos \- ro);

let max\_dist \= length(light\_pos \- ro);

var shadow\_intensity \= 1.0;

// Hard intersection check first to save cycles  
for (var i \= 0u; i \< uniforms.num\_walls; i \= i \+ 1u) {  
    let t \= ray\_wall\_intersect(ro, rd, walls\[i\].p1, walls\[i\].p2);  
    if (t \> 0.0 && t \< max\_dist) {  
        return 0.0; // Hard occlusion (In umbra)  
    }  
}

// Penumbra approximation (simplified for 2D VTT performance)  
// We check the distance from the ray to the wall endpoints.  
// In a full 3D implementation, this would march a Signed Distance Field.  
let k \= 10.0; // Softness factor  
for (var i \= 0u; i \< uniforms.num\_walls; i \= i \+ 1u) {  
    // Calculate perpendicular distance from light ray to wall endpoints  
    let w \= walls\[i\];  
      
    let pa \= w.p1 \- ro;  
    let pb \= w.p2 \- ro;  
      
    let t\_a \= dot(pa, rd);  
    let t\_b \= dot(pb, rd);  
      
    if (t\_a \> 0.0 && t\_a \< max\_dist) {  
        let dist\_a \= length(pa \- rd \* t\_a);  
        shadow\_intensity \= min(shadow\_intensity, k \* dist\_a / t\_a);  
    }  
    if (t\_b \> 0.0 && t\_b \< max\_dist) {  
        let dist\_b \= length(pb \- rd \* t\_b);  
        shadow\_intensity \= min(shadow\_intensity, k \* dist\_b / t\_b);  
    }  
}

return clamp(shadow\_intensity, 0.0, 1.0);

}

/\* STREAMING\_CHUNK: Dispatching main compute kernel thread execution... \*/

// We use 8x8 thread workgroups. This perfectly maps to the 2D output texture grid.

@compute @workgroup\_size(8, 8, 1\)

fn main(@builtin(global\_invocation\_id) global\_id: vec3) {

let tex\_coords \= vec2(global\_id.xy);

let f\_coords \= vec2(f32(tex\_coords.x), f32(tex\_coords.y));

// Boundary check to prevent writing out of texture bounds  
if (f\_coords.x \>= uniforms.resolution.x || f\_coords.y \>= uniforms.resolution.y) {  
    return;  
}

var final\_color \= vec3\<f32\>(0.0, 0.0, 0.0);

// Iterate over all light sources (typically max 10-20 active on screen)  
for (var i \= 0u; i \< uniforms.num\_lights; i \= i \+ 1u) {  
    let light \= lights\[i\];  
    let dist \= length(light.position \- f\_coords);  
      
    // Fast early exit if pixel is outside the light's absolute radius  
    if (dist \> light.radius) {  
        continue;  
    }  
      
    // Inverse square attenuation (physical light falloff)  
    let attenuation \= 1.0 / (1.0 \+ (dist \* dist \* 0.0005));  
      
    // Calculate Line of Sight / Soft Shadows  
    let visibility \= calculate\_soft\_shadow(f\_coords, light.position, light.radius);  
      
    // Additive light blending  
    final\_color \= final\_color \+ (light.color \* light.intensity \* attenuation \* visibility);  
}

// Tone mapping and clamp  
final\_color \= clamp(final\_color, vec3\<f32\>(0.0), vec3\<f32\>(1.0));

// Write the accumulated lighting and visibility mask to the storage texture  
textureStore(output\_tex, tex\_coords, vec4\<f32\>(final\_color, 1.0));

}