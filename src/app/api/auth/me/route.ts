import { NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { COOKIE_NAME } from '@/lib/constants'

export async function GET(request: Request) {
  const token = request.headers.get('cookie')
    ?.split(';')
    .map((item) => item.trim())
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`))
    ?.split('=')[1]

  // „Cine sunt?" pentru un vizitator neautentificat nu e o eroare — răspunsul valid e „nimeni".
  // Întoarcem 200 cu user:null (nu 401) ca să nu polueze consola browserului la fiecare încărcare
  // de pagină din partea vizitatorilor delogați. Navbar-ul citește oricum doar `data.user`.
  if (!token) {
    return NextResponse.json({ user: null })
  }

  const user = await getUserFromToken(token)
  if (!user) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } })
}
