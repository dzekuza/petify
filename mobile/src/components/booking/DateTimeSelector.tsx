import { useState } from 'react'
import { View, Text, Pressable, ScrollView, Platform } from 'react-native'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { format, addDays, isBefore, startOfDay } from 'date-fns'
import { lt } from 'date-fns/locale'

interface DateTimeSelectorProps {
  selectedDate: Date | null
  selectedTime: string | null
  onDateChange: (date: Date) => void
  onTimeChange: (time: string) => void
}

// Generate 30-min time slots from 09:00 to 17:30
function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = 9; h <= 17; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
    if (h < 17 || h === 17) {
      slots.push(`${h.toString().padStart(2, '0')}:30`)
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()
const today = startOfDay(new Date())
const minDate = new Date()

// Generate next 30 days for quick date selection
function generateDateOptions(): Date[] {
  const dates: Date[] = []
  for (let i = 0; i < 30; i++) {
    dates.push(addDays(today, i))
  }
  return dates
}

export function DateTimeSelector({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: DateTimeSelectorProps) {
  const [showNativePicker, setShowNativePicker] = useState(false)
  const dateOptions = generateDateOptions()

  const handleNativeDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowNativePicker(Platform.OS === 'ios')
    if (date) onDateChange(date)
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b' }}>
        Pasirinkite datą ir laiką
      </Text>

      {/* Date Selection */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>Data</Text>

        {/* Quick date pills - horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          {dateOptions.slice(0, 14).map(date => {
            const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')

            return (
              <Pressable
                key={date.toISOString()}
                onPress={() => onDateChange(date)}
                style={{
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: isSelected ? '#6366f1' : '#e2e8f0',
                  backgroundColor: isSelected ? '#6366f1' : '#ffffff',
                  minWidth: 60,
                }}
              >
                <Text style={{
                  fontSize: 11,
                  color: isSelected ? '#e0e7ff' : '#94a3b8',
                  textTransform: 'capitalize',
                }}>
                  {isToday ? 'Šiandien' : format(date, 'EEE', { locale: lt })}
                </Text>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: isSelected ? '#ffffff' : '#1e293b',
                }}>
                  {format(date, 'd')}
                </Text>
                <Text style={{
                  fontSize: 11,
                  color: isSelected ? '#e0e7ff' : '#94a3b8',
                  textTransform: 'capitalize',
                }}>
                  {format(date, 'MMM', { locale: lt })}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        {/* Calendar picker button */}
        <Pressable
          onPress={() => setShowNativePicker(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 8,
          }}
        >
          <Text style={{ fontSize: 14, color: '#6366f1', fontWeight: '500' }}>
            📅 {selectedDate
              ? format(selectedDate, 'EEEE, MMMM d', { locale: lt })
              : 'Pasirinkti kitą datą'}
          </Text>
        </Pressable>

        {showNativePicker && (
          <DateTimePicker
            value={selectedDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleNativeDateChange}
            minimumDate={minDate}
            locale="lt"
          />
        )}
      </View>

      {/* Time Selection */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>Laikas</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {TIME_SLOTS.map(slot => {
            const isSelected = slot === selectedTime
            // Disable past times for today
            const isPast = selectedDate &&
              format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') &&
              isBefore(
                new Date(`${format(today, 'yyyy-MM-dd')}T${slot}:00`),
                new Date()
              )

            return (
              <Pressable
                key={slot}
                onPress={() => !isPast && onTimeChange(slot)}
                disabled={!!isPast}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: isSelected ? '#6366f1' : isPast ? '#f1f5f9' : '#e2e8f0',
                  backgroundColor: isSelected ? '#6366f1' : isPast ? '#f8fafc' : '#ffffff',
                  opacity: isPast ? 0.5 : 1,
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: isSelected ? '600' : '400',
                  color: isSelected ? '#ffffff' : isPast ? '#94a3b8' : '#1e293b',
                }}>
                  {slot}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    </ScrollView>
  )
}
