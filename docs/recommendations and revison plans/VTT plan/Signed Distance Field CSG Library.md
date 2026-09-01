/\* STREAMING\_CHUNK: Initializing SDF basic geometric primitives... \*/

// \-----------------------------------------------------------------------------

// @file sdf\_csg\_core.wgsl

// @description Stage 3.4: Dynamic environment geometry and boolean math.

// Contains the mathematical library for Signed Distance Fields (SDFs) and

// Constructive Solid Geometry (CSG), allowing infinite-scaling architecture.

// \-----------------------------------------------------------------------------

// Sphere SDF

// Returns the shortest distance from point 'p' to a sphere of radius 'r' centered at origin.

// Negative if inside, positive if outside, 0 on the exact surface.

fn sdSphere(p: vec3, r: f32) \-\> f32 {

return length(p) \- r;

}

// Box SDF

// 'b' is a vec3 denoting the half-extents (width/2, height/2, depth/2) of the box.

fn sdBox(p: vec3, b: vec3) \-\> f32 {

let d \= abs(p) \- b;

return length(max(d, vec3(0.0))) \+ min(max(d.x, max(d.y, d.z)), 0.0);

}

// Cylinder SDF

// 'h' contains (radius, height)

fn sdCylinder(p: vec3, h: vec2) \-\> f32 {

let d \= abs(vec2(length(p.xz), p.y)) \- h;

return min(max(d.x, d.y), 0.0) \+ length(max(d, vec2(0.0)));

}

/\* STREAMING\_CHUNK: Implementing Constructive Solid Geometry (CSG) operators... \*/

// CSG Union: Merges two SDF shapes.

fn opUnion(d1: f32, d2: f32) \-\> f32 {

return min(d1, d2);

}

// CSG Subtraction: Carves d1 out of d2 (e.g., carving a doorway out of a wall).

fn opSubtract(d1: f32, d2: f32) \-\> f32 {

return max(-d1, d2);

}

// CSG Intersection: Returns only the overlapping volume of d1 and d2.

fn opIntersect(d1: f32, d2: f32) \-\> f32 {

return max(d1, d2);

}

/\* STREAMING\_CHUNK: Implementing advanced blending and domain repetition... \*/

// Polynomial Smooth Minimum (smin)

// Creates an organic, melting blend between two shapes (e.g., alien organic architecture).

// 'k' controls the smoothness radius.

fn opSmoothUnion(d1: f32, d2: f32, k: f32) \-\> f32 {

let h \= clamp(0.5 \+ 0.5 \* (d2 \- d1) / k, 0.0, 1.0);

return mix(d2, d1, h) \- k \* h \* (1.0 \- h);

}

// Domain Repetition (mod math)

// Mathematically folds space to create infinite grids of objects (e.g., server racks, pillars)

// without consuming extra memory. 'c' is the repetition spacing.

fn opRep(p: vec3, c: vec3) \-\> vec3 {

let half\_c \= c \* 0.5;

// We use a custom modulo to handle negative space correctly

let modulo\_p \= p \- c \* floor(p / c);

return modulo\_p \- half\_c;

}

/\* STREAMING\_CHUNK: Example Map Evaluation Function... \*/

// This function demonstrates how the BVHBuilder (Stage 3.2) dynamically

// compiles the parsed map vectors into a continuous CSG function for the shader.

fn map(p: vec3) \-\> f32 {

// Example: A central room (Box)

var d \= sdBox(p, vec3(10.0, 5.0, 10.0));

// Example: Domain repetition for infinite pillars spaced 4.0 units apart  
let q \= opRep(p, vec3\<f32\>(4.0, 0.0, 4.0));  
let pillars \= sdCylinder(q, vec2\<f32\>(0.5, 5.0));

// Add pillars to the room  
d \= opUnion(d, pillars);

// Example: Carving out an archway using subtraction and a sphere  
let arch\_carver \= sdSphere(p \- vec3\<f32\>(0.0, 0.0, 10.0), 3.0);  
d \= opSubtract(arch\_carver, d);

return d;

}