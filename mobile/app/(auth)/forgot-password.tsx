import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native'
import { Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { t } from '@/constants/translations'

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    if (!email) return
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
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
          {sent ? (
            <View style={{ gap: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 48 }}>📧</Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>
                {t('auth.forgotPassword.successTitle')}
              </Text>
              <Text style={{ fontSize: 16, color: '#64748b', textAlign: 'center' }}>
                {t('auth.forgotPassword.successDesc')}
              </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text style={{ fontSize: 16, color: '#6366f1', fontWeight: '600', marginTop: 16 }}>
                    {t('auth.forgotPassword.backToSignIn')}
                  </Text>
                </Pressable>
              </Link>
            </View>
          ) : (
            <>
              <View style={{ gap: 8, marginBottom: 32 }}>
                <Text style={{ fontSize: 32, fontWeight: '700', color: '#1e293b' }}>
                  {t('auth.forgotPassword.title')}
                </Text>
                <Text style={{ fontSize: 16, color: '#64748b' }}>
                  {t('auth.forgotPassword.description')}
                </Text>
              </View>

              <View style={{ gap: 16 }}>
                <Input
                  label={t('auth.forgotPassword.emailAddress')}
                  placeholder={t('auth.forgotPassword.enterEmail')}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />

                {error ? (
                  <Text style={{ fontSize: 14, color: '#ef4444', textAlign: 'center' }}>
                    {error}
                  </Text>
                ) : null}

                <Button
                  title={loading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendResetLink')}
                  onPress={handleReset}
                  loading={loading}
                  disabled={!email}
                  size="lg"
                />

                <Link href="/(auth)/sign-in" asChild>
                  <Pressable style={{ alignSelf: 'center', marginTop: 8 }}>
                    <Text style={{ fontSize: 14, color: '#6366f1', fontWeight: '500' }}>
                      {t('auth.forgotPassword.backToSignIn')}
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
