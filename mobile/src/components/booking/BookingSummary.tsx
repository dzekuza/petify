import { View, Text, ScrollView } from 'react-native'
import { format } from 'date-fns'
import { lt } from 'date-fns/locale'
import type { Service, Pet, ServiceProvider } from '@/types'

interface BookingSummaryProps {
  provider: ServiceProvider
  service: Service
  pets: Pet[]
  date: Date
  time: string
  totalPrice: number
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
      <Text style={{ fontSize: 14, color: '#64748b' }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '500', color: '#1e293b', flex: 1, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  )
}

export function BookingSummary({ provider, service, pets, date, time, totalPrice }: BookingSummaryProps) {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b' }}>
        Užsakymo apžvalga
      </Text>
      <Text style={{ fontSize: 14, color: '#64748b' }}>
        Patikrinkite duomenis prieš patvirtindami
      </Text>

      {/* Provider & Service */}
      <View style={{
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderCurve: 'continuous',
        padding: 16,
        gap: 2,
      }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
          {provider.businessName}
        </Text>
        {provider.location?.city ? (
          <Text style={{ fontSize: 13, color: '#64748b' }}>
            📍 {provider.location.city}
          </Text>
        ) : null}
      </View>

      {/* Details */}
      <View style={{
        borderWidth: 1,
        borderColor: '#f1f5f9',
        borderRadius: 16,
        borderCurve: 'continuous',
        paddingHorizontal: 16,
      }}>
        <SummaryRow label="Paslauga" value={service.name} />
        <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />
        <SummaryRow label="Trukmė" value={`${service.duration} min`} />
        <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />
        <SummaryRow
          label="Data"
          value={format(date, 'EEEE, MMMM d', { locale: lt })}
        />
        <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />
        <SummaryRow label="Laikas" value={time} />
        <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />
        <SummaryRow
          label={pets.length > 1 ? 'Gyvūnai' : 'Gyvūnas'}
          value={pets.map(p => p.name).join(', ')}
        />
      </View>

      {/* Price breakdown */}
      <View style={{
        borderWidth: 1,
        borderColor: '#f1f5f9',
        borderRadius: 16,
        borderCurve: 'continuous',
        paddingHorizontal: 16,
      }}>
        <SummaryRow label={`${service.name} × ${pets.length}`} value={`€${totalPrice.toFixed(2)}`} />
        <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b' }}>Iš viso</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#6366f1' }}>
            €{totalPrice.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={{
        backgroundColor: '#fef3c7',
        borderRadius: 12,
        borderCurve: 'continuous',
        padding: 14,
        gap: 4,
      }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#92400e' }}>
          Atšaukimo sąlygos
        </Text>
        <Text style={{ fontSize: 12, color: '#92400e', lineHeight: 18 }}>
          Galite nemokamai atšaukti užsakymą iki 24 valandų prieš paslaugos pradžią.
        </Text>
      </View>
    </ScrollView>
  )
}
