# BookitNow.lt Training Providers Import

This directory contains scripts to import training providers and their services
from BookitNow.lt into the PetiFy database.

## Overview

The import process adds 4 real training centers from Lithuania with their
complete service offerings:

### Imported Providers

1. **Dresūros centras | Nemirseta**
   - Location: Klaipėdos pl. 33, Nemirseta
   - Services: 1 (Įvadinė dresūros pamoka)
   - Price: €50.00

2. **Dresūros centras | Palanga**
   - Location: Vytauto g. 58, Palanga
   - Services: 1 (Įvadinė dresūros pamoka)
   - Price: €50.00

3. **Fracco dresūros mokykla**
   - Location: Brastos g. 89, Vilnius
   - Services: 3 (Individuali pamoka, 2 nuotoliniai seminarai)
   - Price range: €15.00 - €27.00

4. **Reksas - Šunų pamokos Vilniuje**
   - Location: Daugėliškio g. 32a, Vilnius
   - Services: 2 (Konsultacija dėl elgesio, Jauno šuniuko auklėjimas)
   - Price range: €50.00 - €60.00

## Files

- `insert-bookitnow-training-import.sql` - Complete import script with providers
  and services
- `insert-bookitnow-training-providers.sql` - Providers only
- `insert-bookitnow-training-services.sql` - Services only
- `run-bookitnow-training-import.sh` - Automated import script
- `README-bookitnow-training-import.md` - This documentation

## Quick Start

### Prerequisites

1. Supabase CLI installed and configured
2. Access to your Supabase project
3. Database permissions to insert data

### Running the Import

1. **Navigate to project root:**
   ```bash
   cd /path/to/petify
   ```

2. **Run the import script:**
   ```bash
   ./scripts/run-bookitnow-training-import.sh
   ```

3. **Or run manually:**
   ```bash
   supabase db reset --db-url "$(supabase status | grep 'DB URL' | awk '{print $3}')" < scripts/insert-bookitnow-training-import.sql
   ```

## Service Categories

All imported services are categorized as `training` and include:

### Service Types

- **Įvadinė dresūros pamoka** - Introduction to dog training
- **Individuali dresūros pamoka** - Individual training sessions
- **Nuotolinis seminaras** - Online seminars
- **Konsultacija dėl elgesio** - Behavior consultation
- **Jauno šuniuko auklėjimas** - Puppy training

### Service Features

- Duration: 40-60 minutes
- Max pets: 1 per session
- Requirements: Advance booking, 24h cancellation notice
- Includes: Professional guidance, behavior analysis, training plans

## Data Structure

### Provider Data

- Business type: `training`
- Location: Full address with coordinates
- Availability: Standard business hours
- Certifications: Professional training certifications
- Experience: 8-12 years

### Service Data

- Category: `training`
- Pricing: €15.00 - €60.00
- Duration: 40-60 minutes
- Requirements: Age restrictions, booking requirements
- Includes: Detailed service descriptions

## Verification

After import, verify the data:

1. **Check providers:**
   ```sql
   SELECT business_name, business_type, location FROM providers WHERE business_type = 'training';
   ```

2. **Check services:**
   ```sql
   SELECT name, category, price FROM services WHERE category = 'training';
   ```

3. **Check user accounts:**
   ```sql
   SELECT email, raw_user_meta_data FROM auth.users WHERE role = 'provider';
   ```

## Troubleshooting

### Common Issues

1. **Permission denied:**
   - Ensure you have database write permissions
   - Check Supabase project access

2. **Script not found:**
   - Run from project root directory
   - Check file permissions: `chmod +x scripts/run-bookitnow-training-import.sh`

3. **Supabase CLI not found:**
   - Install Supabase CLI: https://supabase.com/docs/guides/cli
   - Ensure it's in your PATH

4. **Database connection issues:**
   - Verify Supabase project is running
   - Check network connectivity
   - Verify project credentials

### Manual Import

If the automated script fails, you can import manually:

1. **Connect to your database**
2. **Run the SQL script:**
   ```sql
   \i scripts/insert-bookitnow-training-import.sql
   ```

## Data Sources

All data was scraped from:

- https://www.bookitnow.lt/gyvunu-dresura

The data includes:

- Real business names and locations
- Actual service descriptions
- Current pricing information
- Professional certifications
- Service requirements and inclusions

## Notes

- All prices are in EUR
- Times are in Europe/Lithuania timezone
- Services require advance booking
- 24-hour cancellation notice required
- Some services offer home visits for additional fees

## Support

For issues with the import process:

1. Check the troubleshooting section above
2. Verify your Supabase setup
3. Review the SQL script for syntax errors
4. Check database logs for detailed error messages
