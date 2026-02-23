import { View, TextInput, Pressable, Text } from 'react-native'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  onClear?: () => void
}

export function SearchBar({ value, onChangeText, placeholder = 'Ieškoti...', onClear }: SearchBarProps) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f1f5f9',
      borderRadius: 12,
      borderCurve: 'continuous',
      paddingHorizontal: 14,
      gap: 8,
    }}>
      <Text style={{ fontSize: 16 }}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={{
          flex: 1,
          fontSize: 16,
          color: '#1e293b',
          paddingVertical: 12,
        }}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 ? (
        <Pressable onPress={onClear} hitSlop={8}>
          <Text style={{ fontSize: 16, color: '#94a3b8' }}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  )
}
