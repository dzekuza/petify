import { View, Text, type ViewStyle, type ImageStyle } from 'react-native'
import { Image } from 'expo-image'

interface AvatarProps {
  uri?: string | null
  name?: string
  size?: number
  style?: ViewStyle
}

export function Avatar({ uri, name, size = 40, style }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#e2e8f0',
          } as ImageStyle,
          style as ImageStyle,
        ]}
        contentFit="cover"
        transition={200}
      />
    )
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderCurve: 'continuous',
          backgroundColor: '#6366f1',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={{ color: '#ffffff', fontSize: size * 0.4, fontWeight: '600' }}>
        {initials}
      </Text>
    </View>
  )
}
