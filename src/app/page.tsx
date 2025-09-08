import { Layout } from '@/components/layout'
import { HeroSection } from '@/components/hero-section'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <Layout>
      <HeroSection />
    </Layout>
  )
}
