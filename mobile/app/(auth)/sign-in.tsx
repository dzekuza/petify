import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native'
import { Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { t } from '@/constants/translations'

export default function SignInScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async () => {
    if (!email || !password) return
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: 8, marginBottom: 32 }}>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#1e293b' }}>
              {t('auth.signin.welcomeBack')}
            </Text>
            <Text style={{ fontSize: 16, color: '#64748b' }}>
              {t('auth.signin.signIn')}
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            <Input
              label={t('auth.signin.emailAddress')}
              placeholder={t('auth.signin.enterEmail')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
            />
            <Input
              label={t('auth.signin.password')}
              placeholder={t('auth.signin.enterPassword')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              autoComplete="password"
            />

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable>
                <Text style={{ fontSize: 14, color: '#6366f1', textAlign: 'right', fontWeight: '500' }}>
                  {t('auth.signin.forgotPassword')}
                </Text>
              </Pressable>
            </Link>

            {error ? (
              <Text style={{ fontSize: 14, color: '#ef4444', textAlign: 'center' }}>
                {error}
              </Text>
            ) : null}

            <Button
              title={loading ? t('auth.signin.signingIn') : t('auth.signin.signIn')}
              onPress={handleSignIn}
              loading={loading}
              disabled={!email || !password}
              size="lg"
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4 }}>
            <Text style={{ fontSize: 14, color: '#64748b' }}>
              {t('auth.signin.noAccount')}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable>
                <Text style={{ fontSize: 14, color: '#6366f1', fontWeight: '600' }}>
                  {t('auth.signin.signUp')}
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
