export const COOKIE_NAME = 'vatrio_token'

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
const insecureDevelopmentSecrets = new Set(['dev_secret_vatrio', 'dev_secret_clavium'])
if (isProdDeploy && (!secret || insecureDevelopmentSecrets.has(secret) || secret.length < 32)) {
  throw new Error('JWT_SECRET trebuie setat în producție (minim 32 de caractere).')
}
export const JWT_SECRET = secret ?? 'dev_secret_vatrio'

// URL-ul public al aplicației — baza tuturor linkurilor absolute (emailuri de verificare /
// resetare parolă, alerte căutări salvate, sitemap, metadataBase). Prioritate:
//   1. APP_URL explicit (setează-l în producție pe domeniul real);
//   2. pe Vercel, fără APP_URL: domeniul de producție al proiectului (doar pe deployment-ul de
//      producție), altfel URL-ul deployment-ului curent (Preview) — necesită „Automatically
//      expose System Environment Variables” (activ implicit);
//   3. localhost (dev local).
function resolveAppUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
export const APP_URL = resolveAppUrl()
export const COMMISSION_PERCENT = 5
// Avansul (arvuna) plătit la activarea antecontractului de vânzare, ca procent din preț.
export const SALE_DEPOSIT_PERCENT = 10
