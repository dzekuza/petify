import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LoadingProps {
  className?: string
  text?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export const Loading = ({ 
  className, 
  text = 'Loading...', 
  size = 'md',
  showText = true 
}: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-20 h-7',
    md: 'w-30 h-10', 
    lg: 'w-40 h-13'
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="text-center">
        <Image
          src="/PetiFy.svg"
          alt="PetiFy"
          width={size === 'sm' ? 80 : size === 'md' ? 120 : 160}
          height={size === 'sm' ? 28 : size === 'md' ? 40 : 52}
          className={cn("mx-auto mb-4 animate-pulse", sizeClasses[size])}
          priority
        />
        {showText && (
          <p className="text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  )
}


// Card loading component
export const CardLoading = ({ 
  text = 'Loading...', 
  size = 'sm',
  showText = true 
}: Omit<LoadingProps, 'className'>) => {
  return (
    <div className="flex items-center justify-center py-8">
      <Loading text={text} size={size} showText={showText} />
    </div>
  )
}
