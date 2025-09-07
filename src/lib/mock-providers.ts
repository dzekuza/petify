import { ServiceProvider, Service } from '@/types'

// Mock services data
export const mockServices: Service[] = [
  {
    id: '1',
    providerId: '1',
    category: 'grooming',
    name: 'Pilnas šukavimas',
    description: 'Profesionalus šukavimas su maudymu ir džiovinimu',
    price: 45,
    duration: 120,
    maxPets: 1,
    requirements: ['Vakcinacijos sertifikatas'],
    includes: ['Šukavimas', 'Maudymas', 'Džiovinimas', 'Nagių kirpimas'],
    images: [],
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    providerId: '2',
    category: 'veterinary',
    name: 'Sveikatos patikrinimas',
    description: 'Išsamus sveikatos patikrinimas ir konsultacija',
    price: 60,
    duration: 60,
    maxPets: 1,
    requirements: ['Vakcinacijos istorija'],
    includes: ['Fizinė apžiūra', 'Konsultacija', 'Rekomendacijos'],
    images: [],
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '3',
    providerId: '3',
    category: 'training',
    name: 'Pagrindinės treniruotės',
    description: 'Pradinės komandos ir elgesio mokymas',
    price: 80,
    duration: 90,
    maxPets: 1,
    requirements: ['Šuo turi būti bent 3 mėn. amžiaus'],
    includes: ['Treniruotės sesija', 'Namų užduotys', 'Konsultacija'],
    images: [],
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '4',
    providerId: '4',
    category: 'boarding',
    name: 'Dienos prieglauda',
    description: 'Saugi prieglauda dienos metu',
    price: 25,
    duration: 480,
    maxPets: 1,
    requirements: ['Vakcinacijos sertifikatas', 'Sveikatos pažymėjimas'],
    includes: ['Maitinimas', 'Pasivaikščiojimas', 'Žaidimai'],
    images: [],
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

// Mock providers data
export const mockProviders: ServiceProvider[] = [
  {
    id: '1',
    userId: 'user1',
    businessName: 'Šunų šukavimo salonas "Grazuolė"',
    description: 'Profesionalūs šukavimo paslaugos jūsų kailuotų draugų. 15 metų patirtis.',
    services: ['grooming'],
    location: {
      address: 'Vytauto g. 15',
      city: 'Palanga',
      state: 'Klaipėdos apskritis',
      zipCode: 'LT-00135',
      coordinates: { lat: 55.9175, lng: 21.0686 }
    },
    rating: 4.9,
    reviewCount: 127,
    priceRange: { min: 35, max: 65 },
    availability: {
      monday: [{ start: '09:00', end: '18:00', available: true }],
      tuesday: [{ start: '09:00', end: '18:00', available: true }],
      wednesday: [{ start: '09:00', end: '18:00', available: true }],
      thursday: [{ start: '09:00', end: '18:00', available: true }],
      friday: [{ start: '09:00', end: '18:00', available: true }],
      saturday: [{ start: '10:00', end: '16:00', available: true }],
      sunday: []
    },
    images: ['/placeholder-grooming-1.jpg'],
    certifications: ['Profesionalus šukavimo sertifikatas'],
    experience: 15,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    userId: 'user2',
    businessName: 'Veterinarijos klinika "Širdis"',
    description: 'Šiuolaikinė veterinarijos klinika su pilnu įranga. 24/7 pagalba.',
    services: ['veterinary'],
    location: {
      address: 'Taikos pr. 25',
      city: 'Vilnius',
      state: 'Vilniaus apskritis',
      zipCode: 'LT-01110',
      coordinates: { lat: 54.6872, lng: 25.2797 }
    },
    rating: 4.8,
    reviewCount: 89,
    priceRange: { min: 50, max: 120 },
    availability: {
      monday: [{ start: '08:00', end: '20:00', available: true }],
      tuesday: [{ start: '08:00', end: '20:00', available: true }],
      wednesday: [{ start: '08:00', end: '20:00', available: true }],
      thursday: [{ start: '08:00', end: '20:00', available: true }],
      friday: [{ start: '08:00', end: '20:00', available: true }],
      saturday: [{ start: '09:00', end: '17:00', available: true }],
      sunday: [{ start: '10:00', end: '16:00', available: true }]
    },
    images: ['/placeholder-veterinary-1.jpg'],
    certifications: ['Veterinarijos licencija', 'Chirurgijos sertifikatas'],
    experience: 12,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '3',
    userId: 'user3',
    businessName: 'Šunų treniruotės "Išmintis"',
    description: 'Profesionalūs treniruotės su individualiu požiūriu į kiekvieną šunį.',
    services: ['training'],
    location: {
      address: 'Gedimino pr. 45',
      city: 'Kaunas',
      state: 'Kauno apskritis',
      zipCode: 'LT-44240',
      coordinates: { lat: 54.8985, lng: 23.9036 }
    },
    rating: 4.95,
    reviewCount: 156,
    priceRange: { min: 70, max: 120 },
    availability: {
      monday: [{ start: '10:00', end: '19:00', available: true }],
      tuesday: [{ start: '10:00', end: '19:00', available: true }],
      wednesday: [{ start: '10:00', end: '19:00', available: true }],
      thursday: [{ start: '10:00', end: '19:00', available: true }],
      friday: [{ start: '10:00', end: '19:00', available: true }],
      saturday: [{ start: '09:00', end: '17:00', available: true }],
      sunday: []
    },
    images: ['/placeholder-training-1.jpg'],
    certifications: ['Kynologijos sertifikatas', 'Elgesio modifikavimo licencija'],
    experience: 8,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '4',
    userId: 'user4',
    businessName: 'Gyvūnų prieglauda "Namai"',
    description: 'Šilti namai jūsų augintiniams, kai jūsų nėra. 24/7 priežiūra.',
    services: ['boarding'],
    location: {
      address: 'Maironio g. 12',
      city: 'Šiauliai',
      state: 'Šiaulių apskritis',
      zipCode: 'LT-76285',
      coordinates: { lat: 55.9339, lng: 23.3167 }
    },
    rating: 4.7,
    reviewCount: 203,
    priceRange: { min: 20, max: 40 },
    availability: {
      monday: [{ start: '00:00', end: '23:59', available: true }],
      tuesday: [{ start: '00:00', end: '23:59', available: true }],
      wednesday: [{ start: '00:00', end: '23:59', available: true }],
      thursday: [{ start: '00:00', end: '23:59', available: true }],
      friday: [{ start: '00:00', end: '23:59', available: true }],
      saturday: [{ start: '00:00', end: '23:59', available: true }],
      sunday: [{ start: '00:00', end: '23:59', available: true }]
    },
    images: ['/placeholder-boarding-1.jpg'],
    certifications: ['Gyvūnų priežiūros licencija'],
    experience: 6,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '5',
    userId: 'user5',
    businessName: 'Šunų šukavimas "Švaru"',
    description: 'Greitas ir kokybiškas šukavimas. Tik natūralūs produktai.',
    services: ['grooming'],
    location: {
      address: 'Laisvės al. 78',
      city: 'Palanga',
      state: 'Klaipėdos apskritis',
      zipCode: 'LT-00135',
      coordinates: { lat: 55.9200, lng: 21.0700 }
    },
    rating: 4.6,
    reviewCount: 94,
    priceRange: { min: 30, max: 55 },
    availability: {
      monday: [{ start: '08:00', end: '17:00', available: true }],
      tuesday: [{ start: '08:00', end: '17:00', available: true }],
      wednesday: [{ start: '08:00', end: '17:00', available: true }],
      thursday: [{ start: '08:00', end: '17:00', available: true }],
      friday: [{ start: '08:00', end: '17:00', available: true }],
      saturday: [{ start: '09:00', end: '15:00', available: true }],
      sunday: []
    },
    images: ['/placeholder-grooming-2.jpg'],
    certifications: ['Šukavimo sertifikatas'],
    experience: 10,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '6',
    userId: 'user6',
    businessName: 'Veterinarijos centras "Sveikata"',
    description: 'Moderni veterinarijos klinika su chirurgijos skyriumi.',
    services: ['veterinary'],
    location: {
      address: 'Konstitucijos pr. 3',
      city: 'Vilnius',
      state: 'Vilniaus apskritis',
      zipCode: 'LT-09308',
      coordinates: { lat: 54.6892, lng: 25.2798 }
    },
    rating: 4.9,
    reviewCount: 178,
    priceRange: { min: 45, max: 150 },
    availability: {
      monday: [{ start: '07:00', end: '21:00', available: true }],
      tuesday: [{ start: '07:00', end: '21:00', available: true }],
      wednesday: [{ start: '07:00', end: '21:00', available: true }],
      thursday: [{ start: '07:00', end: '21:00', available: true }],
      friday: [{ start: '07:00', end: '21:00', available: true }],
      saturday: [{ start: '08:00', end: '18:00', available: true }],
      sunday: [{ start: '09:00', end: '17:00', available: true }]
    },
    images: ['/placeholder-veterinary-2.jpg'],
    certifications: ['Veterinarijos licencija', 'Chirurgijos specializacija'],
    experience: 18,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '7',
    userId: 'user7',
    businessName: 'Šunų treniruotės "Komanda"',
    description: 'Grupinės ir individualios treniruotės. Patyrę treneriai.',
    services: ['training'],
    location: {
      address: 'Vilniaus g. 67',
      city: 'Kaunas',
      state: 'Kauno apskritis',
      zipCode: 'LT-44240',
      coordinates: { lat: 54.9000, lng: 23.9050 }
    },
    rating: 4.8,
    reviewCount: 112,
    priceRange: { min: 60, max: 100 },
    availability: {
      monday: [{ start: '09:00', end: '18:00', available: true }],
      tuesday: [{ start: '09:00', end: '18:00', available: true }],
      wednesday: [{ start: '09:00', end: '18:00', available: true }],
      thursday: [{ start: '09:00', end: '18:00', available: true }],
      friday: [{ start: '09:00', end: '18:00', available: true }],
      saturday: [{ start: '10:00', end: '16:00', available: true }],
      sunday: []
    },
    images: ['/placeholder-training-2.jpg'],
    certifications: ['Kynologijos licencija'],
    experience: 11,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '8',
    userId: 'user8',
    businessName: 'Gyvūnų namai "Šilti kampai"',
    description: 'Šeimyniški namai jūsų augintiniams. Didelė teritorija žaidimams.',
    services: ['boarding'],
    location: {
      address: 'Tilžės g. 34',
      city: 'Šiauliai',
      state: 'Šiaulių apskritis',
      zipCode: 'LT-76285',
      coordinates: { lat: 55.9350, lng: 23.3180 }
    },
    rating: 4.85,
    reviewCount: 167,
    priceRange: { min: 25, max: 45 },
    availability: {
      monday: [{ start: '00:00', end: '23:59', available: true }],
      tuesday: [{ start: '00:00', end: '23:59', available: true }],
      wednesday: [{ start: '00:00', end: '23:59', available: true }],
      thursday: [{ start: '00:00', end: '23:59', available: true }],
      friday: [{ start: '00:00', end: '23:59', available: true }],
      saturday: [{ start: '00:00', end: '23:59', available: true }],
      sunday: [{ start: '00:00', end: '23:59', available: true }]
    },
    images: ['/placeholder-boarding-2.jpg'],
    certifications: ['Gyvūnų priežiūros licencija', 'Psichologijos sertifikatas'],
    experience: 9,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

// Helper function to get providers by category
export const getProvidersByCategory = (category: string): ServiceProvider[] => {
  return mockProviders.filter(provider => provider.services.includes(category as ServiceProvider['services'][0]))
}

// Helper function to get popular providers (high rating)
export const getPopularProviders = (): ServiceProvider[] => {
  return mockProviders
    .filter(provider => provider.rating >= 4.7)
    .sort((a, b) => b.rating - a.rating)
}

// Helper function to get available this weekend providers
export const getWeekendAvailableProviders = (): ServiceProvider[] => {
  return mockProviders.filter(provider => {
    const saturday = provider.availability.saturday
    const sunday = provider.availability.sunday
    return (saturday && saturday.length > 0) || (sunday && sunday.length > 0)
  })
}

