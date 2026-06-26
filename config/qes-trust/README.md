# Ancore de încredere QES (certificate root ale furnizorilor calificați)

Acest director conține certificatele **root/intermediar** ale furnizorilor calificați
de servicii de încredere (QTSP) acceptați pentru semnătura electronică calificată (QES).
Un certificat de semnatar e considerat *calificat* doar dacă lanțul lui se închide într-una
dintre ancorele de aici (vezi `src/lib/qesVerify.ts`).

## Cum se populează

Pune fișierele PEM (`.pem` / `.crt` / `.cer`) ale CA-urilor calificate în acest director.
Un fișier poate conține mai multe certificate (bundle). Serverul le încarcă la prima
verificare și le păstrează în cache.

Furnizori calificați din România (eIDAS, lista oficială ANCOM / EU Trusted List):

- **certSIGN** — https://www.certsign.ro/ro/suport/certificate-ca/
- **Transsped** — https://www.transsped.ro/
- **DigiSign** — https://www.digisign.ro/
- **Alfasign** — https://www.alfasign.ro/

Descarcă root-urile (și intermediarii) calificați de pe site-urile lor sau din
EU Trusted List (https://eidas.ec.europa.eu/efda/tl-browser/) și salvează-i aici.

## Important

- **Fișierele de certificate NU se comit** (vezi `.gitignore`) — sunt configurare operațională.
- Dacă directorul e gol, verificarea QES **eșuează închis**: nicio semnătură nu e acceptată
  (în producție serverul refuză semnarea). Asta previne acceptarea unui certificat necalificat.
- Calea poate fi suprascrisă cu variabila de mediu `QES_TRUST_DIR`.
