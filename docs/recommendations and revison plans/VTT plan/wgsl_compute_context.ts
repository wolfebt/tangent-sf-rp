/**
 * @file WGSLComputeContext.ts
 * @description Stage 3.1: WebGPU compute pipeline configuration and memory alignment.
 * Manages the compilation of compute shaders (WGSL), creates compute pipelines,
 * and handles the strict 16-byte memory padding requirements of WebGPU uniform buffers.
 */

export class WGSLComputeContext {
  private device: GPUDevice | null = null;
  
  // Cache of compiled compute pipelines to prevent recompilation stutters
  private pipelineCache: Map<string, GPUComputePipeline> = new Map();

  /**
   * Initializes the compute context with the active GPU device.
   * Typically passed down from the RendererContext (Stage 2.1).
   */
  public initialize(device: GPUDevice) {
    this.device = device;
    console.log('[WGSL Compute] Compute Context Initialized.');
  }

  /**
   * Compiles a WGSL shader string into a reusable GPUComputePipeline.
   * Caches the result using a unique identifier.
   */
  public async getOrCreatePipeline(id: string, wgslCode: string, entryPoint: string = 'main'): Promise<GPUComputePipeline> {
    if (!this.device) throw new Error('[WGSL Compute] Device not initialized.');

    if (this.pipelineCache.has(id)) {
      return this.pipelineCache.get(id)!;
    }

    // Compile the shader module
    const shaderModule = this.device.createShaderModule({
      label: `ShaderModule_${id}`,
      code: wgslCode,
    });

    // Create the pipeline asynchronously to avoid blocking the main thread
    const pipeline = await this.device.createComputePipelineAsync({
      label: `ComputePipeline_${id}`,
      layout: 'auto', // Automatically infer bind group layouts from the WGSL code
      compute: {
        module: shaderModule,
        entryPoint: entryPoint,
      },
    });

    this.pipelineCache.set(id, pipeline);
    console.log(`[WGSL Compute] Pipeline '${id}' compiled and cached.`);
    
    return pipeline;
  }

  /**
   * CRITICAL VTT FUNCTION: WebGPU Uniform and Storage buffers demand strict 16-byte alignments.
   * If we pass a struct with three 32-bit floats (x, y, z = 12 bytes), WebGPU will silently 
   * corrupt the data reading the next struct unless we pad it to 16 bytes.
   * This utility forces Float32Arrays to respect this boundary.
   */
  public alignTo16Bytes(data: number[]): Float32Array {
    // 1 float32 = 4 bytes. Therefore, 16 bytes = 4 floats.
    const floatsPerStruct = 4; 
    
    // Calculate how many floats we actually need to satisfy the boundary
    const paddedLength = Math.ceil(data.length / floatsPerStruct) * floatsPerStruct;
    
    const paddedArray = new Float32Array(paddedLength);
    paddedArray.set(data);
    
    return paddedArray;
  }

  /**
   * Dispatches a compute workload to the GPU.
   * @param pipeline The compiled compute pipeline
   * @param bindGroups The configured buffers mapping data to the WGSL @group(0) @binding(X) slots
   * @param workgroupCountX How many 64-thread workgroups to dispatch on the X axis
   */
  public dispatchCompute(pipeline: GPUComputePipeline, bindGroups: GPUBindGroup[], workgroupCountX: number) {
    if (!this.device) return;

    // Create a command encoder to record the GPU commands
    const commandEncoder = this.device.createCommandEncoder();
    
    // Begin the compute pass
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(pipeline);
    
    // Bind the data (e.g., walls, light positions, output textures)
    bindGroups.forEach((group, index) => {
      passEncoder.setBindGroup(index, group);
    });

    // Dispatch the threads (e.g., if we have 1000 particles and a workgroup size of 64, we dispatch Math.ceil(1000/64))
    passEncoder.dispatchWorkgroups(workgroupCountX);
    passEncoder.end();

    // Submit the recorded commands to the GPU queue for immediate execution
    this.device.queue.submit([commandEncoder.finish()]);
  }
}