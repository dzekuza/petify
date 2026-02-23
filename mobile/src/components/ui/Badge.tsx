import { View, Text, type ViewStyle } from 'react-native'

interface BadgeProps {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  style?: ViewStyle
}

const variantColors: Record<string, { bg: string; text: string }> = {
  default: { bg: '#f1f5f9', text: '#475569' },
  success: { bg: '#dcfce7', text: '#166534' },
  warning: { bg: '#fef3c7', text: '#92400e' },
  error: { bg: '#fee2e2', text: '#991b1b' },
  info: { bg: '#dbeafe', text: '#1e40af' },
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const colors = variantColors[variant]

  return (
    <View
      style={[
        {
          backgroundColor: colors.bg,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
          borderCurve: 'continuous',
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 12, fontWeight: '500', color: colors.text }}>
        {label}
      </Text>
    </View>
  )
}
