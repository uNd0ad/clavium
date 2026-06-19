// Hook de pornire Next.js: rulează o singură dată la pornirea serverului.
// Validăm aici variabilele de mediu, ca un deploy configurat greșit să pice imediat
// în loc să ruleze cu integrări care eșuează silențios (vezi src/lib/env.ts).
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('./lib/env')
    validateEnv()
  }
}
