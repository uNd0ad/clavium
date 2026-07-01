export const COOKIE_NAME = 'clavium_token'

const secret = process.env.JWT_SECRET
// Enforcarea strictă a JWT_SECRET se aplică DOAR deployment-ului de producție real. Pe Vercel toate
// deployment-urile rulează cu NODE_ENV=production, dar `VERCEL_ENV` distinge producția (branch-ul de
// producție) de Preview (ex. branch-ul `dev`) și Development. Astfel, deployment-urile Preview pot
// porni cu un secret de fallback (nu necesită config completă), iar producția rămâne strictă.
// Self-hosted (fără VERCEL_ENV): strict când NODE_ENV=production.
// ATENȚIE: pe Preview, sesiunile sunt semnate cu un secret de dev cunoscut — nu folosi acel mediu cu
// utilizatori/date reale; setează JWT_SECRET și pe Preview dacă vrei securitate deplină.
const isProdDeploy = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === 'production'
  : process.env.NODE_ENV === 'production'
if (isProdDeploy && (!secret || secret === 'dev_secret_clavium' || secret.length < 32)) {
  throw new Error('JWT_SECRET trebuie setat în producție (minim 32 de caractere).')
}
export const JWT_SECRET = secret ?? 'dev_secret_clavium'

export const APP_URL = process.env.APP_URL ?? 'http://localhost:3000'
export const COMMISSION_PERCENT = 5
// Avansul (arvuna) plătit la activarea antecontractului de vânzare, ca procent din preț.
export const SALE_DEPOSIT_PERCENT = 10
