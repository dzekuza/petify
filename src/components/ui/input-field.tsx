'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'
import { Input } from './input'
import { Textarea } from './textarea'

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  required?: boolean
  containerClassName?: string
  labelClassName?: string
}

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helperText?: string
  required?: boolean
  containerClassName?: string
  labelClassName?: string
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required = false, 
    containerClassName, 
    labelClassName,
    className,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className={cn('w-full space-y-2', containerClassName)}>
        <Label 
          htmlFor={inputId} 
          className={cn(
            'text-sm font-medium text-gray-700',
            error && 'text-red-600',
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

InputField.displayName = 'InputField'

const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required = false, 
    containerClassName, 
    labelClassName,
    className,
    id,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className={cn('w-full space-y-2', containerClassName)}>
        <Label 
          htmlFor={textareaId} 
          className={cn(
            'text-sm font-medium text-gray-700',
            error && 'text-red-600',
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <Textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full resize-none',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

TextareaField.displayName = 'TextareaField'

export { InputField, TextareaField }
