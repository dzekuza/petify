import { View, Text, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/auth-context'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const fullName = user?.user_metadata?.full_name ?? ''
  const email = user?.email ?? ''

  const menuItems = [
    { label: 'Redaguoti profilį', icon: '✏️', onPress: () => router.push('/(tabs)/profile/edit') },
    { label: 'Mano gyvūnai', icon: '🐾', onPress: () => router.push('/(tabs)/profile/pets') },
    { label: 'Mėgstami', icon: '❤️', onPress: () => router.push('/(tabs)/profile/favorites') },
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Avatar uri={user?.user_metadata?.avatar_url} name={fullName} size={80} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#1e293b' }}>
              {fullName}
            </Text>
            <Text style={{ fontSize: 14, color: '#64748b' }}>
              {email}
            </Text>
          </View>
        </View>

        <View style={{ gap: 4 }}>
          {menuItems.map(item => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                paddingVertical: 16,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderCurve: 'continuous',
                backgroundColor: pressed ? '#f8fafc' : 'transparent',
              })}
            >
              <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#1e293b', flex: 1 }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: 18, color: '#94a3b8' }}>›</Text>
            </Pressable>
          ))}
        </View>

        <Button
          title="Atsijungti"
          onPress={signOut}
          variant="outline"
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  )
}
