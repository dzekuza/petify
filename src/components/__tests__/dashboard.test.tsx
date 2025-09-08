import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { t } from '@/lib/translations'

// Mock the dashboard API
vi.mock('@/lib/dashboard', () => ({
  dashboardApi: {
    getDashboardStats: vi.fn().mockResolvedValue({
      totalBookings: 10,
      completedBookings: 8,
      pendingBookings: 2,
      totalRevenue: 1200,
      averageRating: 4.5,
      totalReviews: 15
    }),
    getRecentBookings: vi.fn().mockResolvedValue([
      {
        id: '1',
        customerName: 'Jonas Jonaitis',
        service: 'Šunų šukavimas',
        date: '2024-01-15',
        status: 'pending',
        amount: 50
      }
    ]),
    getProviderProfileStatus: vi.fn().mockResolvedValue({
      profileComplete: true,
      verification: 'verified',
      availability: 'complete'
    }),
    getProviderByUserId: vi.fn().mockResolvedValue({
      id: 'provider-1',
      business_name: 'Test Business'
    })
  }
}))

// Mock auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      user_metadata: {
        full_name: 'Test Provider'
      }
    }
  })
}))

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('Dashboard Translations', () => {
  it('should have Lithuanian translations for dashboard elements', () => {
    // Test key dashboard translations
    expect(t('providerDashboard.title')).toBe('Teikėjo valdymo skydas')
    expect(t('providerDashboard.welcomeBack')).toBe('Sveiki sugrįžę')
    expect(t('providerDashboard.totalBookings')).toBe('Iš viso užsakymų')
    expect(t('providerDashboard.completed')).toBe('Užbaigta')
    expect(t('providerDashboard.totalRevenue')).toBe('Bendros pajamos')
    expect(t('providerDashboard.averageRating')).toBe('Vidutinis įvertinimas')
    expect(t('providerDashboard.recentBookings')).toBe('Paskutiniai užsakymai')
    expect(t('providerDashboard.quickActions')).toBe('Greiti veiksmai')
    expect(t('providerDashboard.profileStatus')).toBe('Profilio būsena')
  })

  it('should have status translations', () => {
    expect(t('providerDashboard.status.pending')).toBe('Laukiantis')
    expect(t('providerDashboard.status.confirmed')).toBe('Patvirtintas')
    expect(t('providerDashboard.status.completed')).toBe('Užbaigtas')
    expect(t('providerDashboard.status.cancelled')).toBe('Atšauktas')
  })

  it('should have profile status translations', () => {
    expect(t('providerDashboard.verified')).toBe('Patvirtinta')
    expect(t('providerDashboard.complete')).toBe('Užbaigta')
    expect(t('providerDashboard.pending')).toBe('Laukiantis')
  })
})
