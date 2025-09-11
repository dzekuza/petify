// Pagrindiniai tipai gyvūnų paslaugų rinkai

export type ServiceCategory = 
  | 'grooming' // šukavimas
  | 'veterinary' // veterinarija
  | 'boarding' // prieglauda
  | 'training' // treniruotės
  | 'sitting' // prižiūrėjimas
  | 'adoption' // veislynai

export type ServiceStatus = 'active' | 'inactive' | 'pending' // aktyvus | neaktyvus | laukiama

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' // laukiama | patvirtinta | užbaigta | atšaukta

export type UserRole = 'customer' | 'provider' | 'admin' // klientas | paslaugų teikėjas | administratorius

export interface User {
  id: string
  email: string
  fullName: string // pilnas vardas
  avatar?: string // avataras
  role: UserRole // rolė
  phone?: string // telefonas
  address?: string // adresas
  city?: string // miestas
  state?: string // valstija
  zipCode?: string // pašto kodas
  createdAt: string // sukurtas
  updatedAt: string // atnaujintas
}

export interface ServiceProvider {
  id: string
  userId: string
  businessName: string // verslo pavadinimas
  businessType?: string // verslo tipas
  description: string // aprašymas
  services: ServiceCategory[] // paslaugos
  location: {
    address: string // adresas
    city: string // miestas
    state: string // valstija
    zipCode: string // pašto kodas
    coordinates: {
      lat: number // platuma
      lng: number // ilguma
    }
  }
  contactInfo?: {
    phone: string // telefonas
    email: string // el. paštas
    website?: string // svetainė
  }
  rating: number // įvertinimas
  reviewCount: number // atsiliepimų skaičius
  priceRange: {
    min: number // minimumas
    max: number // maksimumas
  }
  availability: {
    monday: TimeSlot[] // pirmadienis
    tuesday: TimeSlot[] // antradienis
    wednesday: TimeSlot[] // trečiadienis
    thursday: TimeSlot[] // ketvirtadienis
    friday: TimeSlot[] // penktadienis
    saturday: TimeSlot[] // šeštadienis
    sunday: TimeSlot[] // sekmadienis
  }
  images: string[] // paveikslėliai
  avatarUrl?: string // avataro nuoroda
  certifications?: string[] // sertifikatai
  experience: number // patirtis (metai)
  status: ServiceStatus // būsena
  createdAt: string // sukurtas
  updatedAt: string // atnaujintas
}

export interface TimeSlot {
  start: string // pradžia (HH:MM formatas)
  end: string // pabaiga (HH:MM formatas)
  available: boolean // prieinama
}

export interface Service {
  id: string
  providerId: string
  category: ServiceCategory // kategorija
  name: string // pavadinimas
  description: string // aprašymas
  price: number // kaina
  duration: number // trukmė (minutės)
  maxPets: number // maksimalus gyvūnų skaičius
  requirements?: string[] // reikalavimai
  includes?: string[] // įskaičiuota
  images: string[] // paveikslėliai
  status: ServiceStatus // būsena
  createdAt: string // sukurtas
  updatedAt: string // atnaujintas
}

export interface Booking {
  id: string
  customerId: string // kliento ID
  providerId: string // paslaugų teikėjo ID
  serviceId: string // paslaugos ID
  petId?: string // gyvūno ID (vienas gyvūnas užsakymui)
  date: string // data (YYYY-MM-DD)
  timeSlot: TimeSlot // laiko intervalas
  totalPrice: number // bendra kaina
  status: BookingStatus // būsena
  notes?: string // pastabos
  createdAt: string // sukurtas
  updatedAt: string // atnaujintas
  // Užpildyti laukai (ne duomenų bazėje)
  pet?: Pet // gyvūnas
  service?: Service // paslauga
  provider?: ServiceProvider // paslaugų teikėjas
}

export interface Pet {
  id: string
  ownerId: string // savininko ID
  name: string // vardas
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other' // rūšis: šuo | katė | paukštis | triušis | kita
  breed?: string // veislė
  age: number // amžius (metai)
  weight?: number // svoris (kg)
  specialNeeds?: string[] // specialūs poreikiai
  medicalNotes?: string // medicinos pastabos
  profilePicture?: string // profilio nuotrauka
  galleryImages: string[] // galerijos paveikslėliai
  createdAt: string // sukurtas
  updatedAt: string // atnaujintas
}

export interface Review {
  id: string
  bookingId: string // užsakymo ID
  customerId: string // kliento ID
  providerId: string // paslaugų teikėjo ID
  rating: number // įvertinimas (1-5)
  comment: string // komentaras
  images?: string[] // paveikslėliai
  createdAt: string // sukurtas
  updatedAt: string // atnaujintas
}

export interface SearchFilters {
  category?: ServiceCategory // kategorija
  location?: string // vieta
  priceRange?: {
    min: number // minimumas
    max: number // maksimumas
  }
  rating?: number // įvertinimas
  date?: string // data (YYYY-MM-DD formatas)
  availability?: {
    date: string // data
    timeSlot?: TimeSlot // laiko intervalas
  }
  distance?: number // atstumas (km)
  petId?: string // pasirinkto gyvūno ID
}

export interface SearchResult {
  provider: ServiceProvider // paslaugų teikėjas
  services: Service[] // paslaugos
  distance?: number // atstumas
}

// API atsakymų tipai
export interface ApiResponse<T> {
  data: T // duomenys
  message?: string // žinutė
  error?: string // klaida
}

export interface PaginatedResponse<T> {
  data: T[] // duomenys
  pagination: {
    page: number // puslapis
    limit: number // limitas
    total: number // iš viso
    totalPages: number // bendras puslapių skaičius
  }
}

// Formų tipai
export interface CreateBookingForm {
  serviceId: string // paslaugos ID
  date: string // data
  timeSlot: TimeSlot // laiko intervalas
  pets: string[] // gyvūnų ID
  notes?: string // pastabos
}

export interface CreateReviewForm {
  bookingId: string // užsakymo ID
  rating: number // įvertinimas
  comment: string // komentaras
  images?: File[] // paveikslėliai
}

export interface UpdateProfileForm {
  fullName: string // pilnas vardas
  phone?: string // telefonas
  address?: string // adresas
  city?: string // miestas
  state?: string // valstija
  zipCode?: string // pašto kodas
}

export interface CreateServiceForm {
  category: ServiceCategory // kategorija
  name: string // pavadinimas
  description: string // aprašymas
  price: number // kaina
  duration: number // trukmė
  maxPets: number // maksimalus gyvūnų skaičius
  requirements?: string[] // reikalavimai
  includes?: string[] // įskaičiuota
  images?: File[] // paveikslėliai
}

// Pet Ads types
export interface PetAd {
  id: string
  providerId: string
  name: string // gyvūno vardas
  description: string // aprašymas
  price: number // kaina
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other' // rūšis
  breed?: string // veislė
  age?: number // amžius (mėnesiai)
  gender?: 'male' | 'female' // lytis
  size?: 'small' | 'medium' | 'large' // dydis
  color?: string // spalva
  weight?: number // svoris (kg)
  vaccinationStatus?: 'vaccinated' | 'not_vaccinated' | 'unknown' // vakcinacijos būsena
  medicalNotes?: string // medicinos pastabos
  behavioralNotes?: string // elgesio pastabos
  specialNeeds?: string[] // specialūs poreikiai
  images: string[] // paveikslėliai
  isActive: boolean // ar aktyvus
  createdAt: string // sukurtas
  updatedAt: string // atnaujintas
}

export interface PetAdRequest {
  id: string
  petAdId: string
  customerId: string
  message?: string // žinutė
  status: 'pending' | 'approved' | 'rejected' | 'completed' // būsena
  createdAt: string // sukurtas
  updatedAt: string // atnaujintas
  // Užpildyti laukai
  petAd?: PetAd // skelbimas
  customer?: User // klientas
}

export interface CreatePetAdForm {
  name: string // gyvūno vardas
  description: string // aprašymas
  price: number // kaina
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other' // rūšis
  breed?: string // veislė
  age?: number // amžius
  gender?: 'male' | 'female' // lytis
  size?: 'small' | 'medium' | 'large' // dydis
  color?: string // spalva
  weight?: number // svoris
  vaccinationStatus?: 'vaccinated' | 'not_vaccinated' | 'unknown' // vakcinacijos būsena
  medicalNotes?: string // medicinos pastabos
  behavioralNotes?: string // elgesio pastabos
  specialNeeds?: string[] // specialūs poreikiai
  images?: File[] // paveikslėliai
}

// Notification data types
export interface NotificationData {
  customer_name?: string // kliento vardas
  service_date?: string // paslaugos data
  amount?: number // suma
  rating?: number // įvertinimas
  booking_id?: string // užsakymo ID
  service_name?: string // paslaugos pavadinimas
  provider_name?: string // paslaugų teikėjo vardas
}
