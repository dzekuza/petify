import { View, Text } from 'react-native'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}>
      {icon ? (
        <Text style={{ fontSize: 48 }}>{icon}</Text>
      ) : null}
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', textAlign: 'center' }}>
        {title}
      </Text>
      {description ? (
        <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 }}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={{ marginTop: 8 }} />
      ) : null}
    </View>
  )
}
