import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PropertyCard from '@/components/properties/PropertyCard'
import ServiceCard from '@/components/ServiceCard'
import SlideSnap from '@/components/sections/SlideSnap'
import SlideRenters from '@/components/sections/SlideRenters'
import SlideOwners from '@/components/sections/SlideOwners'
import SlideDevelopers from '@/components/sections/SlideDevelopers'
import SlideHowItWorks from '@/components/sections/SlideHowItWorks'
import { getHomeData } from '@/lib/homepage'
import { getEurRonRate } from '@/lib/exchangeRate'
import { getNavUser } from '@/lib/session'
import { SERVICES } from '@/lib/services'

// Homepage ca „slide deck" în 4 slide-uri, fiecare adresat unei audiențe (vezi „Design Re-Shaped").
// Datele dinamice (listările recente) vin prin getHomeData; cardurile sunt randate aici
// (server) și pasate slide-urilor client ca props.
export default async function HomePage() {
  const [{ listings }, eurRate, navUser] = await Promise.all([getHomeData(), getEurRonRate(), getNavUser()])

  const featured = listings.slice(0, 3).map((p) => <PropertyCard key={p.id} property={p} eurRate={eurRate} compact />)
  const services = SERVICES.slice(0, 3).map((s) => <ServiceCard key={s.title} service={s} />)

  return (
    <>
      <SlideSnap />
      <Navbar initialUser={navUser} />
      <main>
        <SlideRenters featured={featured} featuredCount={listings.length} />
        <SlideOwners services={services} />
        <SlideDevelopers />
        <SlideHowItWorks />
      </main>
      <Footer />
    </>
  )
}
