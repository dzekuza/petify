import { Layout } from '@/components/layout'
import { HeroSection } from '@/components/hero-section'
import { ServiceCategories } from '@/components/service-categories'
import { FeaturedProviders } from '@/components/featured-providers'

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <ServiceCategories />
      <FeaturedProviders />
    </Layout>
  )
}
