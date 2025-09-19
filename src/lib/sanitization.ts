// Input sanitization utilities for security

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string with HTML entities escaped
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitizes text content for display
 * @param input - The input string to sanitize
 * @param maxLength - Maximum length allowed (default: 1000)
 * @returns Sanitized and truncated string
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Remove null bytes and control characters
  let sanitized = input
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim()

  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * Validates and sanitizes message content
 * @param content - The message content to validate
 * @returns Sanitized content or throws error if invalid
 */
export function validateMessageContent(content: string): string {
  if (!content || typeof content !== 'string') {
    throw new Error('Message content is required')
  }

  const sanitized = sanitizeText(content, 2000) // Max 2000 characters for messages

  if (sanitized.length === 0) {
    throw new Error('Message content cannot be empty')
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error('Message content contains potentially malicious content')
    }
  }

  return sanitized
}

/**
 * Validates conversation ID format
 * @param conversationId - The conversation ID to validate
 * @returns True if valid UUID format
 */
export function validateConversationId(conversationId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(conversationId)
}

/**
 * Validates provider ID format
 * @param providerId - The provider ID to validate
 * @returns True if valid UUID format
 */
export function validateProviderId(providerId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(providerId)
}

/**
 * Rate limiting helper - simple in-memory store (for production, use Redis)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Checks if a user has exceeded rate limits
 * @param userId - User ID to check
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns True if rate limit exceeded
 */
export function checkRateLimit(
  userId: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now()
  const key = userId
  const userLimit = rateLimitStore.get(key)

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return false
  }

  if (userLimit.count >= maxRequests) {
    return true // Rate limit exceeded
  }

  // Increment count
  userLimit.count++
  return false
}

/**
 * Cleans up expired rate limit entries
 */
export function cleanupRateLimit(): void {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Clean up rate limit store every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000)
