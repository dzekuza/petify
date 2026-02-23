import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable, Alert } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { t } from '@/constants/translations'

export default function SignUpScreen() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignUp = async () => {
    setError('')

    if (password.length < 6) {
      setError(t('auth.signup.passwordTooShort'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('auth.signup.passwordsDoNotMatch'))
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    if (error) {
      setError(error.message)
    } else {
      Alert.alert(
        'Patikrinkite el. paštą',
        'Išsiuntėme patvirtinimo nuorodą į jūsų el. paštą.',
        [{ text: 'Gerai', onPress: () => router.replace('/(auth)/sign-in') }]
      )
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
              {t('auth.signup.createAccount')}
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            <Input
              label={t('auth.signup.fullName')}
              placeholder={t('auth.signup.enterFullName')}
              value={fullName}
              onChangeText={setFullName}
              textContentType="name"
              autoComplete="name"
            />
            <Input
              label={t('auth.signup.emailAddress')}
              placeholder={t('auth.signup.enterEmail')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
            />
            <Input
              label={t('auth.signup.createPassword')}
              placeholder={t('auth.signup.passwordMinLength')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
              autoComplete="new-password"
            />
            <Input
              label={t('auth.signup.confirmPassword')}
              placeholder={t('auth.signup.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="newPassword"
            />

            {error ? (
              <Text style={{ fontSize: 14, color: '#ef4444', textAlign: 'center' }}>
                {error}
              </Text>
            ) : null}

            <Button
              title={loading ? t('auth.signup.creatingAccount') : t('auth.signup.createAccount')}
              onPress={handleSignUp}
              loading={loading}
              disabled={!fullName || !email || !password || !confirmPassword}
              size="lg"
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4 }}>
            <Text style={{ fontSize: 14, color: '#64748b' }}>
              {t('auth.signup.haveAccount')}
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable>
                <Text style={{ fontSize: 14, color: '#6366f1', fontWeight: '600' }}>
                  {t('auth.signup.signIn')}
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
