import type { ServiceProvider, Service, Booking, Pet, User, Review, Conversation, Message, TimeSlot } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

export function transformUser(row: Row): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name ?? '',
    avatar: row.avatar_url ?? undefined,
    role: row.role ?? 'customer',
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    zipCode: row.zip_code ?? undefined,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  }
}

export function transformProvider(row: Row): ServiceProvider {
  const location = typeof row.location === 'string' ? JSON.parse(row.location) : row.location ?? {}
  const contactInfo = typeof row.contact_info === 'string' ? JSON.parse(row.contact_info) : row.contact_info
  const priceRange = typeof row.price_range === 'string' ? JSON.parse(row.price_range) : row.price_range ?? { min: 0, max: 0 }
  const availability = typeof row.availability === 'string' ? JSON.parse(row.availability) : row.availability ?? {}

  return {
    id: row.id,
    userId: row.user_id ?? '',
    businessName: row.business_name ?? '',
    businessType: row.business_type ?? undefined,
    description: row.description ?? '',
    services: row.services ?? [],
    location: {
      address: location.address ?? '',
      city: location.city ?? '',
      state: location.state ?? '',
      zipCode: location.zipCode ?? location.zip_code ?? '',
      coordinates: {
        lat: location.coordinates?.lat ?? location.lat ?? 0,
        lng: location.coordinates?.lng ?? location.lng ?? 0,
      },
    },
    contactInfo: contactInfo ? {
      phone: contactInfo.phone ?? '',
      email: contactInfo.email ?? '',
      website: contactInfo.website ?? undefined,
    } : undefined,
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    priceRange: {
      min: priceRange.min ?? 0,
      max: priceRange.max ?? 0,
    },
    availability: {
      monday: availability.monday ?? [],
      tuesday: availability.tuesday ?? [],
      wednesday: availability.wednesday ?? [],
      thursday: availability.thursday ?? [],
      friday: availability.friday ?? [],
      saturday: availability.saturday ?? [],
      sunday: availability.sunday ?? [],
    },
    images: row.images ?? [],
    avatarUrl: row.avatar_url ?? undefined,
    certifications: row.certifications ?? undefined,
    experience: row.experience_years ?? 0,
    status: row.status ?? 'active',
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  }
}

export function transformService(row: Row): Service {
  return {
    id: row.id,
    providerId: row.provider_id ?? '',
    category: row.category ?? 'grooming',
    name: row.name ?? '',
    description: row.description ?? '',
    price: row.price ?? 0,
    duration: row.duration ?? 0,
    maxPets: row.max_pets ?? 1,
    requirements: row.requirements ?? undefined,
    includes: row.includes ?? undefined,
    images: row.images ?? [],
    status: row.status ?? 'active',
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
    maleCount: row.male_count ?? undefined,
    femaleCount: row.female_count ?? undefined,
    breed: row.breed ?? undefined,
    generation: row.generation ?? undefined,
    ageWeeks: row.age_weeks ?? undefined,
    ageDays: row.age_days ?? undefined,
    readyToLeave: row.ready_to_leave ?? undefined,
    microchipped: row.microchipped ?? undefined,
    vaccinated: row.vaccinated ?? undefined,
    wormed: row.wormed ?? undefined,
    healthChecked: row.health_checked ?? undefined,
    parentsTested: row.parents_tested ?? undefined,
    kcRegistered: row.kc_registered ?? undefined,
  }
}

export function transformBooking(row: Row): Booking {
  return {
    id: row.id,
    customerId: row.customer_id ?? '',
    providerId: row.provider_id ?? '',
    serviceId: row.service_id ?? '',
    petId: row.pet_id ?? undefined,
    date: row.booking_date ?? row.date ?? '',
    timeSlot: {
      start: row.start_time ?? '',
      end: row.end_time ?? '',
      available: true,
    } as TimeSlot,
    totalPrice: row.total_price ?? 0,
    status: row.status ?? 'pending',
    notes: row.special_instructions ?? row.notes ?? undefined,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
    pet: row.pets ? transformPet(row.pets) : undefined,
    service: row.services ? transformService(row.services) : undefined,
    provider: row.providers ? transformProvider(row.providers) : undefined,
  }
}

export function transformPet(row: Row): Pet {
  return {
    id: row.id,
    ownerId: row.owner_id ?? '',
    name: row.name ?? '',
    species: row.species ?? 'other',
    breed: row.breed ?? undefined,
    age: row.age ?? 0,
    weight: row.weight ?? undefined,
    specialNeeds: row.special_needs ?? undefined,
    medicalNotes: row.medical_notes ?? undefined,
    profilePicture: row.profile_picture ?? undefined,
    galleryImages: row.gallery_images ?? [],
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  }
}

export function transformReview(row: Row): Review {
  return {
    id: row.id,
    bookingId: row.booking_id ?? '',
    customerId: row.customer_id ?? '',
    providerId: row.provider_id ?? '',
    rating: row.rating ?? 0,
    comment: row.comment ?? '',
    images: row.images ?? undefined,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  }
}

export function transformConversation(row: Row): Conversation {
  return {
    id: row.id,
    customerId: row.customer_id ?? '',
    providerId: row.provider_id ?? '',
    lastMessage: row.last_message ?? undefined,
    lastMessageAt: row.last_message_at ?? undefined,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
    provider: row.providers ? transformProvider(row.providers) : undefined,
    customer: row.users ? transformUser(row.users) : undefined,
    unreadCount: row.unread_count ?? 0,
  }
}

export function transformMessage(row: Row): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id ?? '',
    senderId: row.sender_id ?? '',
    content: row.content ?? '',
    createdAt: row.created_at ?? '',
  }
}
