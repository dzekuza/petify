'use client'

import { CategorySection } from '@/components/category-section'
import { HeroFilters } from '@/components/hero-filters'
import { t } from '@/lib/translations'

export const HeroSection = () => {



  return (
    <>


      {/* Desktop Hero Section - Hidden on mobile */}
      <div className=" md:block">
        <section className="relative pt-32 pb-12 overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 hero-pattern opacity-50" />

          {/* Gradient orbs for visual interest */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}} />

          <div className="relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 items-center justify-center">
              {/* Main Heading */}
              <div className="text-center animate-fade-in-up">
                <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl mb-6">
                  <span className="gradient-text text-5xl sm:text-6xl lg:text-7xl block mb-2">
                    Raskite tobulą priežiūrą
                  </span>
                  <span className="text-foreground text-4xl sm:text-5xl lg:text-6xl">
                    savo augintiniui
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mt-6">
                  Susisiekite su patikimais gyvūnų priežiūros paslaugų teikėjais jūsų regione
                </p>
              </div>

              {/* Search Form - Responsive Layout */}
              {/* Search Filters */}
              <div className="animate-fade-in-up stagger-1 w-full flex justify-center">
                <HeroFilters />
              </div>


              {/* Category Sections - Multiple grooming sections */}
              <div className="w-full space-y-12 pt-24">
                {/* Popular Providers (slider of providers) */}
                <CategorySection
                  title="Populiarūs gyvūnų kirpimo salonai"
                  category="grooming"
                  limit={16}
                  mode="providers"
                />

                {/* Top Rated Grooming Services (services for dogs) */}
                <CategorySection
                  title="Geriausiai įvertinti kirpėjai"
                  category="grooming"
                  limit={16}
                />

                {/* New Grooming Services (services for dogs) */}
                <CategorySection
                  title="Nauji gyvūnų kirpimo salonai"
                  category="grooming"
                  limit={16}
                />

                {/* Featured Grooming Services (services for dogs) */}
                <CategorySection
                  title="Rekomenduojami kirpėjai"
                  category="grooming"
                  limit={16}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
