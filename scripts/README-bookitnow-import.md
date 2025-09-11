# BookitNow.lt Grooming Providers Import

This directory contains SQL scripts to import real grooming providers from
BookitNow.lt into your PetiFy Supabase database.

## 📋 What's Included

### Providers Added:

1. **Vanilos salonas – gyvūnų kirpykla** (Kaunas)
   - Address: Verkių g. 48B, Kaunas
   - Rating: 5.0 (2 reviews)
   - Services: Higieninis kirpimas (€25), Pilnas kirpimas (€38)

2. **OH MY DOG šunų ir kačių kirpykla** (Kaunas)
   - Address: Kęstučio g. 59, Kaunas
   - Services: Mažo šuns kirpimas (€40), Vidutinio šuns kirpimas (€45), Didelio
     šuns kirpimas (€60)

3. **Zoohotel – naminių gyvūnų grožio salonas Pavilnyje** (Vilnius)
   - Address: Juodasis kl. 31, Vilnius
   - Services: Jorkšyro terjeras (€35), K. Karolio spanielis (€40), Biglis (€45)

4. **Zoohotel – naminių gyvūnų grožio salonas Naujojoje Vilnioje** (Vilnius)
   - Address: A. Kojelavičiaus g. 168, Vilnius
   - Services: Jorkšyro terjeras (€35), Korgis (€45), Mišrūnas iki 10 kg (€35)

5. **Zoohotel – naminių gyvūnų grožio salonas Lazdynuose** (Vilnius)
   - Address: Architektų g. 70, Vilnius
   - Services: Mišrūnas iki 10 kg (€35), Garbanotasis bišonas (€45), Mišrūnas
     10-20 kg (€45)

6. **Šunų ir kačių kirpykla „Keturkojų stilius"** (Kėdainiai)
   - Address: J. Basanavičiaus g. 21, Kėdainiai
   - Services: Mažo šuns kirpimas (€20), Vidutinio šuns kirpimas (€25), Didelio
     šuns kirpimas (€50)

7. **Tauro Grooming & Skin Care** (Vilnius)
   - Address: Verkių g. 27, Vilnius
   - Services: Privati pamoka šeimininikui (€70)

## 🚀 How to Import

### Option 1: Automated Script (Recommended)

```bash
./scripts/run-bookitnow-import.sh
```

### Option 2: Manual Import

```bash
# 1. Create sample customers
supabase db reset < scripts/insert-sample-customers.sql

# 2. Insert providers
supabase db reset < scripts/insert-bookitnow-providers.sql

# 3. Add services
supabase db reset < scripts/insert-bookitnow-services.sql

# 4. Add reviews
supabase db reset < scripts/insert-bookitnow-reviews.sql
```

## 📊 Data Structure

### Provider Data:

- **Business Name**: Real salon names from BookitNow.lt
- **Address**: Actual Lithuanian addresses with coordinates
- **Business Type**: All set to "grooming"
- **Price Range**: Based on actual service prices
- **Images**: Cover images from BookitNow.lt
- **Availability**: Standard business hours (9:00-18:00 weekdays, 10:00-16:00
  Saturday)

### Service Data:

- **Category**: "grooming" or "training" (for Tauro's teaching service)
- **Name**: Exact service names from BookitNow.lt
- **Description**: Detailed service descriptions
- **Price**: Actual prices in EUR
- **Duration**: Service duration in minutes
- **Requirements**: Service-specific requirements
- **Includes**: What's included in each service

### Review Data:

- **Rating**: Realistic ratings (4-5 stars)
- **Comments**: Authentic Lithuanian reviews
- **Dates**: Recent dates for freshness

## 🎯 Benefits

1. **Real Data**: Actual Lithuanian grooming salons with real addresses
2. **Authentic Content**: Real service descriptions and pricing
3. **Geographic Coverage**: Providers in Vilnius, Kaunas, and Kėdainiai
4. **Price Variety**: Services ranging from €20 to €70
5. **Service Diversity**: Different types of grooming services
6. **Review System**: Sample reviews to make providers look authentic

## 🔧 Customization

You can easily modify the scripts to:

- Add more providers from other BookitNow.lt categories
- Adjust pricing or service descriptions
- Add more reviews
- Modify business hours or availability
- Add more service categories

## 📝 Notes

- All providers are set to "active" status
- Business hours are standardized but realistic
- Coordinates are approximate for the given addresses
- User accounts are created for each provider (password: "password123")
- Sample customer accounts are created for reviews

## 🚨 Important

- Make sure you have Supabase CLI installed and configured
- Run this on a development database first
- The scripts use `ON CONFLICT DO NOTHING` to prevent duplicates
- All data is in Lithuanian as it's from a Lithuanian service

## 🔗 Source

Data scraped from: https://www.bookitnow.lt/kirpimas-trimingavimas
