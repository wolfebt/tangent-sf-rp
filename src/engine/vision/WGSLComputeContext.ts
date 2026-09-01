/**
 * @file WGSLComputeContext.ts
 * @description Stage 3.1: WebGPU compute pipeline configuration and memory alignment on the Stage.
 * Manages the compilation of compute shaders (WGSL), creates compute pipelines,
 * and handles the strict 16-byte memory padding requirements of WebGPU uniform buffers.
 */

export class WGSLComputeContext {
  private device: any = null;
  
  // Cache of compiled compute pipelines to prevent recompilation stutters
  private pipelineCache: Map<string, any> = new Map();

  /**
   * Initializes the compute context with the active GPU device.
   * Typically passed down from the RendererContext (Stage 2.1).
   */
  public initialize(device: any) {
    this.device = device;
    console.log('[WGSL Compute] Compute Context Initialized for the Stage.');
  }

  public getDevice(): any {
    return this.device;
  }

  /**
   * Compiles a WGSL shader string into a reusable GPUComputePipeline.
   * Caches the result using a unique identifier.
   */
  public async getOrCreatePipeline(id: string, wgslCode: string, entryPoint: string = 'main'): Promise<any> {
    if (!this.device) throw new Error('[WGSL Compute] GPU Device not initialized.');

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
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: entryPoint,
      },
    });

    this.pipelineCache.set(id, pipeline);
    console.log(`[WGSL Compute] Pipeline '${id}' compiled and cached for the Stage.`);
    
    return pipeline;
  }

  /**
   * WebGPU Uniform and Storage buffers demand strict 16-byte alignments (vec4 = 16 bytes).
   * Pads arrays to respect this boundary.
   */
  public alignTo16Bytes(data: number[]): Float32Array {
    const floatsPerStruct = 4; // 1 float32 = 4 bytes -> 16 bytes = 4 floats
    const paddedLength = Math.ceil(data.length / floatsPerStruct) * floatsPerStruct;
    
    const paddedArray = new Float32Array(paddedLength);
    paddedArray.set(data);
    
    return paddedArray;
  }

  /**
   * Dispatches a compute workload to the GPU.
   * @param pipeline The compiled compute pipeline
   * @param bindGroups The configured buffers mapping data to the WGSL @group(0) @binding(X) slots
   * @param workgroupCountX How many workgroups to dispatch on the X axis
   * @param workgroupCountY How many workgroups to dispatch on the Y axis (default 1)
   */
  public dispatchCompute(pipeline: any, bindGroups: any[], workgroupCountX: number, workgroupCountY: number = 1) {
    if (!this.device) return;

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(pipeline);
    
    bindGroups.forEach((group, index) => {
      passEncoder.setBindGroup(index, group);
    });

    passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
    passEncoder.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }

  public clearCache() {
    this.pipelineCache.clear();
  }
}
