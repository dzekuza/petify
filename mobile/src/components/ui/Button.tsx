import { Pressable, Text, ActivityIndicator, type ViewStyle, type TextStyle } from 'react-native'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  icon?: React.ReactNode
}

const variantStyles: Record<string, ViewStyle> = {
  primary: { backgroundColor: '#6366f1' },
  secondary: { backgroundColor: '#f1f5f9' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e2e8f0' },
  ghost: { backgroundColor: 'transparent' },
  destructive: { backgroundColor: '#ef4444' },
}

const variantTextColors: Record<string, string> = {
  primary: '#ffffff',
  secondary: '#1e293b',
  outline: '#1e293b',
  ghost: '#6366f1',
  destructive: '#ffffff',
}

const sizeStyles: Record<string, { container: ViewStyle; fontSize: number }> = {
  sm: { container: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }, fontSize: 14 },
  md: { container: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }, fontSize: 16 },
  lg: { container: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 14 }, fontSize: 18 },
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderCurve: 'continuous',
          opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
        },
        variantStyles[variant],
        sizeStyles[size].container,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantTextColors[variant]} />
      ) : icon ? (
        icon
      ) : null}
      <Text
        style={[
          {
            fontSize: sizeStyles[size].fontSize,
            fontWeight: '600',
            color: variantTextColors[variant],
            textAlign: 'center',
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  )
}
