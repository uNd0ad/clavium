import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import TickerBar from '@/components/sections/TickerBar'
import TrustBar from '@/components/sections/TrustBar'
import HowItWorksSection from '@/components/sections/HowItWorksSection'
import TransactionTypesSection from '@/components/sections/TransactionTypesSection'
import SignatureSection from '@/components/sections/SignatureSection'
import CtaSection from '@/components/sections/CtaSection'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TickerBar />
        <TrustBar />
        <HowItWorksSection />
        <TransactionTypesSection />
        <SignatureSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
