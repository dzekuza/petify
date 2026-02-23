import { View, Text } from 'react-native'

const STEPS = [
  { label: 'Paslauga' },
  { label: 'Augintinis' },
  { label: 'Data' },
  { label: 'Patvirtinimas' },
]

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 8 }}>
      {STEPS.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep

        return (
          <View key={index} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <View style={{
              height: 4,
              width: '100%',
              borderRadius: 2,
              backgroundColor: isActive ? '#6366f1' : isCompleted ? '#6366f1' : '#e2e8f0',
            }} />
            <Text style={{
              fontSize: 11,
              fontWeight: isActive ? '600' : '400',
              color: isActive ? '#6366f1' : isCompleted ? '#6366f1' : '#94a3b8',
            }}>
              {step.label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
