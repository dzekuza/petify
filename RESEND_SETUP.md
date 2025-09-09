# Resend Email Setup Guide

This guide will help you set up Resend for email functionality in Petify using
the `petify.lt` domain.

## Prerequisites

1. A Resend account (sign up at [resend.com](https://resend.com))
2. Access to the `petify.lt` domain DNS settings
3. Your Resend API key

## Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up for an account
2. Verify your email address
3. Complete the account setup process

## Step 2: Add and Verify Domain

1. In your Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter `petify.lt` as your domain
4. Follow the DNS verification steps:
   - Add the required DNS records to your domain's DNS settings
   - Wait for verification (can take up to 24 hours)

### Required DNS Records

You'll need to add these DNS records to your domain:

```
Type: TXT
Name: @
Value: resend._domainkey.petify.lt

Type: CNAME
Name: resend
Value: resend.com

Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

## Step 3: Get Your API Key

1. In your Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "Petify Production")
4. Copy the API key (it starts with `re_`)

## Step 4: Configure Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@petify.lt
RESEND_DOMAIN=petify.lt
```

## Step 5: Test Email Functionality

1. Start your development server: `pnpm dev`
2. Try signing up for a new account
3. Check that welcome emails are sent
4. Test booking confirmation emails

## Email Templates

The following email templates are included:

### Welcome Email

- Sent when users sign up
- Includes welcome message and platform features
- Styled with Petify branding

### Booking Confirmation

- Sent when a booking is created
- Includes booking details, provider info, and service details
- Professional layout with all necessary information

### Booking Updates

- Sent when booking status changes (confirmed, cancelled, completed)
- Dynamic content based on status
- Includes reason for cancellation if applicable

## Email Features

- **Responsive Design**: All emails work on mobile and desktop
- **Branded Templates**: Consistent with Petify's visual identity
- **Error Handling**: Email failures don't break the main application flow
- **TypeScript Support**: Fully typed email interfaces
- **Template System**: Easy to modify and extend email templates

## Troubleshooting

### Common Issues

1. **Domain not verified**: Make sure all DNS records are correctly added and
   propagated
2. **API key invalid**: Verify your API key is correct and has proper
   permissions
3. **Emails not sending**: Check the Resend dashboard for delivery logs and
   errors
4. **Rate limiting**: Resend has rate limits; check your usage in the dashboard

### Testing in Development

For development, you can use Resend's test mode or a test domain. The emails
will be sent but won't actually deliver to real email addresses.

### Production Considerations

1. **Domain Reputation**: Keep your domain reputation high by following email
   best practices
2. **Bounce Handling**: Monitor bounce rates in your Resend dashboard
3. **Unsubscribe**: Consider adding unsubscribe links for marketing emails
4. **Compliance**: Ensure compliance with email regulations (GDPR, CAN-SPAM,
   etc.)

## API Usage

The email service is integrated into the following flows:

- User registration (`/api/auth/welcome-email`)
- Booking creation (`/api/bookings`)
- Booking updates (`/api/bookings/[id]`)

All email sending is handled asynchronously and won't block the main application
flow if there are issues.

## Support

For Resend-specific issues:

- Check the [Resend Documentation](https://resend.com/docs)
- Contact Resend support through their dashboard
- Review the Resend status page for service issues

For Petify-specific email issues:

- Check the application logs for error messages
- Verify environment variables are set correctly
- Test with the provided email templates
