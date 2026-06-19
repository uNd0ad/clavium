// Potrivire facială în browser pentru KYC (mod local, fără furnizor eIDAS).
// Folosește face-api.js (TensorFlow.js). Modelele sunt găzduite same-origin în /public/models.
// Importăm dinamic biblioteca (rulează doar în browser) ca să nu intre în bundle-ul de server.
import type * as FaceApi from '@vladmandic/face-api'

let faceapi: typeof FaceApi | null = null
let loaded = false

const MODEL_URL = '/models'

// Încarcă o singură dată detectorul, landmark-urile și rețeaua de recunoaștere.
export async function loadFaceModels(): Promise<void> {
  if (loaded) return
  // face-api inițializează singur backend-ul tfjs (WebGL, cu cădere pe CPU) la prima folosire.
  faceapi = await import('@vladmandic/face-api')
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ])
  loaded = true
}

// Embedding-ul (128-D) feței dominante dintr-o imagine; null dacă nu se detectează nicio față.
export async function faceDescriptor(input: HTMLCanvasElement): Promise<Float32Array | null> {
  if (!faceapi) throw new Error('Modelele de recunoaștere facială nu sunt încărcate.')
  const result = await faceapi
    .detectSingleFace(input, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
    .withFaceLandmarks()
    .withFaceDescriptor()
  return result?.descriptor ?? null
}

// Distanța euclidiană între două embedding-uri. Mai mic = fețe mai asemănătoare.
export function faceDistance(a: Float32Array, b: Float32Array): number {
  if (!faceapi) throw new Error('Modelele de recunoaștere facială nu sunt încărcate.')
  return faceapi.euclideanDistance(Array.from(a), Array.from(b))
}
