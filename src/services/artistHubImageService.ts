/**
 * @file artistHubImageService.ts
 * @description Client service for calling the authenticated geminiImageProxy Cloud Function
 * and optionally offloading generated concept art to Firebase Storage.
 */

export const ALLOWED_ARTIST_IMAGE_MODELS = [
  'imagen-3.0-generate-002',
  'imagen-3.0-fast-generate-001',
  'gemini-2.5-flash-image-preview'
] as const;

export type ArtistImageModel = (typeof ALLOWED_ARTIST_IMAGE_MODELS)[number];
export type ArtistImageAspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface ArtistImageGenerationRequest {
  prompt: string;
  model?: ArtistImageModel;
  aspectRatio?: ArtistImageAspectRatio;
  idToken: string;
  appCheckToken?: string;
  proxyUrl?: string;
  persistToStorage?: boolean;
  userId?: string;
  fileName?: string;
  uploadAssetFn?: (dataUrl: string, opts: { userId?: string; assetCategory: string; fileName: string }) => Promise<{ url?: string; offloaded?: boolean }>;
  fetchFn?: typeof fetch;
}

export interface ArtistImageGenerationResult {
  dataUrl: string;
  storageUrl?: string;
  mimeType: string;
  model: string;
}

export function buildImageProxyUrl(): string {
  const envUrl =
    typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_IMAGE_PROXY_URL
      ? String((import.meta as any).env.VITE_GEMINI_IMAGE_PROXY_URL).trim()
      : '';
  if (envUrl) return envUrl;

  const projectId =
    typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID
      ? String((import.meta as any).env.VITE_FIREBASE_PROJECT_ID).trim()
      : '';
  if (projectId) {
    return `https://us-central1-${projectId}.cloudfunctions.net/geminiImageProxy`;
  }
  return '/api/geminiImageProxy';
}

export async function generateConceptArt(
  request: ArtistImageGenerationRequest
): Promise<ArtistImageGenerationResult> {
  const cleanPrompt = String(request.prompt || '').trim();
  if (!cleanPrompt) {
    throw new Error('Concept art prompt cannot be empty.');
  }
  if (cleanPrompt.length > 4000) {
    throw new Error('Concept art prompt exceeds maximum length of 4000 characters.');
  }
  if (!request.idToken || !String(request.idToken).trim()) {
    throw new Error('Authenticated user ID token is required to generate concept art.');
  }

  const model: ArtistImageModel =
    request.model && ALLOWED_ARTIST_IMAGE_MODELS.includes(request.model)
      ? request.model
      : 'imagen-3.0-generate-002';

  const aspectRatio: ArtistImageAspectRatio = request.aspectRatio ?? '1:1';
  const endpoint = request.proxyUrl?.trim() || buildImageProxyUrl();
  const fetchImpl = request.fetchFn || globalThis.fetch;
  if (typeof fetchImpl !== 'function') {
    throw new Error('Fetch API is unavailable in this environment.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${request.idToken.trim()}`
  };
  if (request.appCheckToken) {
    headers['x-firebase-appcheck'] = request.appCheckToken;
  }

  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt: cleanPrompt,
      model,
      aspectRatio
    })
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data?.error || `Concept art generation failed (HTTP ${response.status}).`);
  }

  const imageBase64 = String(data?.imageBase64 || '');
  const mimeType = String(data?.mimeType || 'image/png');
  if (!imageBase64) {
    throw new Error('Image proxy returned empty imageBase64 payload.');
  }

  const dataUrl = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:${mimeType};base64,${imageBase64}`;

  const result: ArtistImageGenerationResult = {
    dataUrl,
    mimeType,
    model: String(data?.model || model)
  };

  if (request.persistToStorage && typeof request.uploadAssetFn === 'function') {
    try {
      const uploadRes = await request.uploadAssetFn(dataUrl, {
        ...(request.userId !== undefined ? { userId: request.userId } : {}),
        assetCategory: 'elements',
        fileName: request.fileName || `concept_${Date.now().toString(36)}`
      });
      if (uploadRes?.url) {
        result.storageUrl = uploadRes.url;
      }
    } catch {
      // Keep generated dataUrl if storage offload fails
    }
  }

  return result;
}
