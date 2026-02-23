import { View, TextInput, Text, type TextInputProps, type ViewStyle } from 'react-native'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewStyle
}

export function Input({ label, error, containerStyle, style, ...props }: InputProps) {
  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label ? (
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[
          {
            borderWidth: 1,
            borderColor: error ? '#ef4444' : '#e2e8f0',
            borderRadius: 12,
            borderCurve: 'continuous',
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: '#1e293b',
            backgroundColor: '#ffffff',
          },
          style,
        ]}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error ? (
        <Text style={{ fontSize: 12, color: '#ef4444' }}>
          {error}
        </Text>
      ) : null}
    </View>
  )
}
