import { useEffect, useRef } from 'react'
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'

export function useRefreshOnFocus(refetch: () => void) {
  const isFirstMount = useRef(true)

  useFocusEffect(
    useCallback(() => {
      if (isFirstMount.current) {
        isFirstMount.current = false
        return
      }
      refetch()
    }, [refetch])
  )
}
