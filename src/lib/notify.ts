import { prisma } from './prisma'
import { captureException } from './logger'

type Variant = 'info' | 'warning' | 'danger' | 'success'

// Notificarea e un efect secundar — nu are voie să strice fluxul principal. Exemplu concret:
// în settleRent() banii sunt deja mutați (tranzacția a fost comisă) când se trimite notificarea;
// dacă insert-ul ar arunca, acțiunea ar eșua DUPĂ încasare — utilizatorul ar vedea eroare la o
// plată reușită, iar webhook-ul Stripe ar reîncerca degeaba (claim-ul idempotent ar sări peste
// notificare și audit definitiv). Ca și recordAuditSafe: nu aruncă niciodată, eșecul se loghează.
export async function notify(userId: string, title: string, description: string, variant: Variant = 'info') {
  try {
    await prisma.notification.create({
      data: { userId, title, description, variant },
    })
  } catch (err) {
    captureException(err, { op: 'notify', userId, title })
  }
}
