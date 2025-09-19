import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Simple template engine for replacing placeholders in HTML templates
 */
export class TemplateEngine {
  /**
   * Replace placeholders in template with data
   */
  static render(template: string, data: Record<string, any>): string {
    let rendered = template

    // Replace simple placeholders {{key}}
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g')
      rendered = rendered.replace(placeholder, String(value || ''))
    })

    // Handle conditional blocks {{#if condition}}...{{/if}}
    rendered = this.processConditionals(rendered, data)

    return rendered
  }

  /**
   * Load template from file
   */
  static loadTemplate(templateName: string): string {
    try {
      const templatePath = join(process.cwd(), 'src/lib/email-templates', `${templateName}.html`)
      return readFileSync(templatePath, 'utf-8')
    } catch (error) {
      console.error(`Failed to load template: ${templateName}`, error)
      throw new Error(`Template not found: ${templateName}`)
    }
  }

  /**
   * Process conditional blocks in template
   */
  private static processConditionals(template: string, data: Record<string, any>): string {
    // Handle {{#if condition}}...{{/if}} blocks
    const ifBlockRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g
    
    return template.replace(ifBlockRegex, (match, condition, content) => {
      if (data[condition]) {
        return content
      }
      return ''
    })
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number): string {
    return `€${amount.toFixed(2)}`
  }

  /**
   * Format date
   */
  static formatDate(date: string | Date): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Format time
   */
  static formatTime(time: string): string {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }
}
