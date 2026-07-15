# Sentry — configurare și operare

Integrarea acoperă browserul, runtime-urile Node și Edge, Server Components, route handlers,
navigările App Router și cele două joburi Vercel Cron. Session Replay și colectarea implicită de
PII sunt dezactivate intenționat deoarece aplicația procesează date KYC, contracte și plăți.
Configurația refuză explicit cookies, antete HTTP, query params, body-uri, date GenAI și variabile
locale din stack; nu depinde de valorile implicite ale versiunii SDK.

## Variabile de mediu

Configurează în Vercel pentru Production și Preview:

- `SENTRY_DSN` și `NEXT_PUBLIC_SENTRY_DSN`: același DSN al proiectului;
- `SENTRY_ORG` și `SENTRY_PROJECT`: slug-urile organizației și proiectului;
- `SENTRY_AUTH_TOKEN`: Organization Auth Token cu acces la proiect și release-uri, disponibil
  numai la build;
- `SENTRY_TRACES_SAMPLE_RATE` și `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`: inițial `0.1`;
- `SENTRY_ENVIRONMENT` și `NEXT_PUBLIC_SENTRY_ENVIRONMENT`: `production` sau `preview`;
- opțional `SENTRY_RELEASE`; fără el SDK-ul folosește metadatele Vercel sau commit-ul git.

Nu expune `SENTRY_AUTH_TOKEN` cu prefixul `NEXT_PUBLIC_` și nu îl salva în repository.

## Verificarea primului deploy

1. Confirmă în logul de build mesajul de upload al source maps.
2. Provoacă o eroare dintr-un handler temporar sau dintr-un buton al aplicației, nu din consola
   DevTools (erorile din consolă sunt izolate de browser).
3. Verifică în Sentry că evenimentul are environment, release și stack trace cu fișierele sursă.
4. Navighează prin câteva pagini și confirmă trace-uri browser → server/API în Performance.
5. Rulează manual, cu `CRON_SECRET`, rutele `/api/cron/cleanup` și `/api/cron/dunning`; monitoarele
   `vatrio-cleanup` și `vatrio-dunning` trebuie să apară cu status OK.

## Alerte recomandate în Sentry

Creează aceste reguli după ce proiectul primește primul eveniment (alertele sunt configurație de
cont Sentry, nu fișiere Next.js):

- Issue Alert: notificare imediată la `A new issue is created` și `The issue changes state from
  resolved to unresolved`, pentru environment `production`;
- Issue Alert: notificare la creștere peste 10 evenimente în 5 minute pentru aceeași problemă;
- Metric Alert: failure rate peste 5% timp de 5 minute pe tranzacțiile `/api/payments/*` și
  `/api/webhooks/stripe`;
- Metric Alert: p95 peste 2 secunde timp de 10 minute pentru tranzacțiile web;
- Cron Alerts: missed și failed check-in pentru ambele monitoare, fără perioadă suplimentară peste
  marja de 10 minute definită în cod.

Trimite alertele P0 către canalul de incident/on-call, iar alertele de latență către canalul tehnic.
După o săptămână de trafic real, ajustează sampling-ul și pragurile folosind datele de volum, nu
prin activarea Session Replay.
