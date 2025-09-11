-- Insert services for BookitNow.lt grooming providers
-- This script adds all the services from the scraped data

-- Vanilos salonas services
INSERT INTO PUBLIC.SERVICES (
    ID,
    PROVIDER_ID,
    CATEGORY,
    NAME,
    DESCRIPTION,
    PRICE,
    DURATION_MINUTES,
    MAX_PETS,
    REQUIREMENTS,
    INCLUDES,
    IMAGES,
    IS_ACTIVE,
    CREATED_AT,
    UPDATED_AT
) VALUES (
    'vanilos-higieninis-kirpimas-id',
    'vanilos-salonas-id',
    'grooming',
    'Higieninis kirpimas (šunys iki 15 kg)',
    'Maudymas, higieninis kirpimas (špicas, Maltos bišonas, vakarų Škotijos terjeras, žaislinis pudelis, nykštukinis pudelis, Jorkšyro terjeras, Ši Cu, pekinas, spanielis, mišrūnai iki 15 kg ir kt.). Jūsų augintinis bus išmaudytas, išdžiovintas, jam bus atliktos higienos procedūros (nagų kirpimas, akių, ausų valymas) ir higieninis kirpimas (plaukų galiukų patrumpinimas papilvėje, aplink uodegą, pėdutes ir snukutį).',
    25.00,
    90, -- 1 val. 30 min.
    1,
    '["Šunys iki 15 kg", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Džiovinimas", "Higieninis kirpimas", "Nagų kirpimas", "Akių valymas", "Ausų valymas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'vanilos-pilnas-kirpimas-id',
    'vanilos-salonas-id',
    'grooming',
    'Pilnas kirpimas (šunys iki 15 kg)',
    'Maudymas, pilnas kirpimas, higienos procedūros (špicas, Maltos bišonas, vakarų Škotijos terjeras, žaislinis pudelis, nykštukinis pudelis, Jorkšyro terjeras, Ši Cu, pekinas, spanielis, mišrūnai iki 15 kg ir kt.). Jūsų augintinis bus išmaudytas, išdžiovintas, jam bus atliktos higienos procedūros (nagų kirpimas, akių, ausų valymas) ir pilnas kailio trumpinimas.',
    38.00,
    120, -- 2 val.
    1,
    '["Šunys iki 15 kg", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Džiovinimas", "Pilnas kirpimas", "Nagų kirpimas", "Akių valymas", "Ausų valymas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
 
-- OH MY DOG services
(
    'oh-my-dog-mazas-sunas-id',
    'oh-my-dog-id',
    'grooming',
    'Mažo šuns (iki 30 cm) kirpimas',
    'Į kirpimo kainą įeina maudymas, šukavimas, pėdučių sutvarkymas, nagų kirpimas, ausų, akių valymas. Kiekvieno šuns sutvarkymo kaina gali keistis, priklausomai nuo procedūros sudėtingumo, kailio būklės, susivėlimo, charakterio.',
    40.00,
    120, -- 2 val.
    1,
    '["Šunys iki 30 cm", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Šukavimas", "Pėdučių sutvarkymas", "Nagų kirpimas", "Ausų valymas", "Akių valymas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'oh-my-dog-didelis-sunas-id',
    'oh-my-dog-id',
    'grooming',
    'Didelio šuns (nuo 50 cm) kirpimas',
    'Į kirpimo kainą įeina maudymas, šukavimas, pėdučių sutvarkymas, nagų kirpimas, ausų, akių valymas. Kiekvieno šuns sutvarkymo kaina gali keistis, priklausomai nuo procedūros sudėtingumo, kailio būklės, susivėlimo, charakterio.',
    60.00,
    120, -- 2 val.
    1,
    '["Šunys nuo 50 cm", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Šukavimas", "Pėdučių sutvarkymas", "Nagų kirpimas", "Ausų valymas", "Akių valymas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'oh-my-dog-vidutinis-sunas-id',
    'oh-my-dog-id',
    'grooming',
    'Vidutinio šuns (iki 50 cm) kirpimas',
    'Į kirpimo kainą įeina maudymas, šukavimas, pėdučių sutvarkymas, nagų kirpimas, ausų, akių valymas. Kiekvieno šuns sutvarkymo kaina gali keistis, priklausomai nuo procedūros sudėtingumo, kailio būklės, susivėlimo, charakterio.',
    45.00,
    120, -- 2 val.
    1,
    '["Šunys iki 50 cm", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Šukavimas", "Pėdučių sutvarkymas", "Nagų kirpimas", "Ausų valymas", "Akių valymas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
 
-- Zoohotel Pavilnys services
(
    'zoohotel-pavilnys-jorksyras-id',
    'zoohotel-pavilnys-id',
    'grooming',
    'Šuns kirpimas ir grožio procedūros (Jorkšyro terjeras)',
    'Šuns maudymas, šukavimas, kirpimas, nagų kirpimas, ausų valymas, kvepinimas.',
    35.00,
    120, -- 2 val.
    1,
    '["Jorkšyro terjeras", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Šukavimas", "Kirpimas", "Nagų kirpimas", "Ausų valymas", "Kvepinimas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'zoohotel-pavilnys-spanielis-id',
    'zoohotel-pavilnys-id',
    'grooming',
    'Šuns kirpimas ir grožio procedūros (K. Karolio spanielis)',
    'Šuns maudymas, šukavimas, kirpimas, nagų kirpimas, ausų valymas, kvepinimas.',
    40.00,
    120, -- 2 val.
    1,
    '["K. Karolio spanielis", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Šukavimas", "Kirpimas", "Nagų kirpimas", "Ausų valymas", "Kvepinimas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'zoohotel-pavilnys-biglis-id',
    'zoohotel-pavilnys-id',
    'grooming',
    'Šuns kirpimas ir grožio procedūros (Biglis)',
    'Šuns maudymas, šukavimas, kirpimas, nagų kirpimas, ausų valymas, kvepinimas.',
    45.00,
    150, -- 2 val. 30 min.
    1,
    '["Biglis", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Šukavimas", "Kirpimas", "Nagų kirpimas", "Ausų valymas", "Kvepinimas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
 
-- Zoohotel Naujoji Vilnia services
(
    'zoohotel-naujoji-jorksyras-id',
    'zoohotel-naujoji-id',
    'grooming',
    'Šuns kirpimas ir grožio procedūros (Jorkšyro terjeras)',
    'Šuns maudymas, šukavimas, kirpimas, nagų kirpimas, ausų valymas, kvepinimas.',
    35.00,
    120, -- 2 val.
    1,
    '["Jorkšyro terjeras", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Šukavimas", "Kirpimas", "Nagų kirpimas", "Ausų valymas", "Kvepinimas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'zoohotel-naujoji-korgis-id',
    'zoohotel-naujoji-id',
    'grooming',
    'Šuns kirpimas ir grožio procedūros (Korgis)',
    'Šuns maudymas, šukavimas, kirpimas, nagų kirpimas, ausų valymas, kvepinimas.',
    45.00,
    180, -- 3 val.
    1,
    '["Korgis", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Šukavimas", "Kirpimas", "Nagų kirpimas", "Ausų valymas", "Kvepinimas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'zoohotel-naujoji-misrunas-id',
    'zoohotel-naujoji-id',
    'grooming',
    'Šuns kirpimas ir grožio procedūros (mišrūnas iki 10 kg.)',
    'Šuns maudymas, šukavimas, kirpimas, nagų kirpimas, ausų valymas, kvepinimas.',
    35.00,
    120, -- 2 val.
    1,
    '["Mišrūnas iki 10 kg", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Šukavimas", "Kirpimas", "Nagų kirpimas", "Ausų valymas", "Kvepinimas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
 
-- Zoohotel Lazdynai services
(
    'zoohotel-lazdynai-misrunas-id',
    'zoohotel-lazdynai-id',
    'grooming',
    'Šuns kirpimas ir grožio procedūros (mišrūnas iki 10 kg.)',
    'Šuns maudymas, šukavimas, kirpimas, nagų kirpimas, ausų valymas, kvepinimas.',
    35.00,
    120, -- 2 val.
    1,
    '["Mišrūnas iki 10 kg", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Šukavimas", "Kirpimas", "Nagų kirpimas", "Ausų valymas", "Kvepinimas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'zoohotel-lazdynai-bisonas-id',
    'zoohotel-lazdynai-id',
    'grooming',
    'Šuns kirpimas ir grožio procedūros (Garbanotasis bišonas)',
    'Šuns maudymas, šukavimas, kirpimas, nagų kirpimas, ausų valymas, kvepinimas.',
    45.00,
    210, -- 3 val. 30min.
    1,
    '["Garbanotasis bišonas", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Šukavimas", "Kirpimas", "Nagų kirpimas", "Ausų valymas", "Kvepinimas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'zoohotel-lazdynai-didelis-misrunas-id',
    'zoohotel-lazdynai-id',
    'grooming',
    'Šuns kirpimas ir grožio procedūros (mišrūnas 10-20 kg.)',
    'Šuns maudymas, šukavimas, kirpimas, nagų kirpimas, ausų valymas, kvepinimas.',
    45.00,
    120, -- 2 val.
    1,
    '["Mišrūnas 10-20 kg", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Šukavimas", "Kirpimas", "Nagų kirpimas", "Ausų valymas", "Kvepinimas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
 
-- Keturkojų Stilius services
(
    'keturkoju-vidutinis-id',
    'keturkoju-stilius-id',
    'grooming',
    'Vidutinio šuns kirpimas',
    'Tavo augintinio laukia 1 val. 30 min. trukmės kirpimas. Paslauga teikiama vidutinio dydžio šunims. Šuo bus išmaudytas, pakirptas, jam bus atliktos higienos procedūros – nagų kirpimas ir ausų valymas.',
    25.00,
    90, -- 1 val. 30 min.
    1,
    '["Vidutinio dydžio šunys", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Kirpimas", "Nagų kirpimas", "Ausų valymas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'keturkoju-mazas-id',
    'keturkoju-stilius-id',
    'grooming',
    'Mažo šuns kirpimas',
    'Tavo augintinio laukia 1 val. 30 min. trukmės kirpimas. Paslauga teikiama mažo dydžio šunims. Šuo bus išmaudytas, pakirptas, jam bus atliktos higienos procedūros – nagų kirpimas ir ausų valymas.',
    20.00,
    90, -- 1 val. 30 min.
    1,
    '["Mažo dydžio šunys", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Kirpimas", "Nagų kirpimas", "Ausų valymas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'keturkoju-didelis-id',
    'keturkoju-stilius-id',
    'grooming',
    'Didelio šuns kirpimas',
    'Tavo augintinio laukia 3 val. 30 min. trukmės kirpimas. Paslauga teikiama didelio dydžio šunims. Šuo bus išmaudytas, jo kailis bus pakirptas, taip pat bus atliktos higienos procedūros – nagų kirpimas ir ausų valymas.',
    50.00,
    210, -- 3 val. 30min.
    1,
    '["Didelio dydžio šunys", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Maudymas", "Kirpimas", "Nagų kirpimas", "Ausų valymas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
 
-- Tauro Grooming services
(
    'tauro-mokymas-id',
    'tauro-grooming-id',
    'training',
    'Privati pamoka šeimininikui su profesionaliu kirpėju',
    'Kviečiame naujus ir esamus šeimininkus į Tauro Grooming & Skin Care organizuojamus individualius 3 valandų mokymus šeimininkams kartu su augintiniu, kurių metu įgysite pasitikėjimo. Šiuose mokymuose kiekvienas augintinio šeimininkas su savo augintiniu: pasirinksite pagal kailio tipą Tauro Pro Line kosmetiką ir eterinius aliejus; išbandysite maudynes ozono vonioje; mokysitės, kaip kirpti augintinio nagus; mokysitės, kaip taisyklingai prižiūrėti ausis, akis, dantis; kaip atlikti higieninį pėdučių apkirpimą, pagal augintinio veislę; su meistro priežiūra ir pagalba savarankiškai atliksite maudymą, džiovinimą, šukavimą; aptarsite kaip dažnai ir kokiomis priemonėmis reiktų šukuoti augintinį, kad jis atrodytų geriausiai kaip tik gali; gausite dovanų ir nuolaidas įsigyti kosmetikai bei priemonėms.',
    70.00,
    180, -- 3 val.
    1,
    '["Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Individualūs mokymai", "Kosmetikos pasirinkimas", "Ozoninės vonios", "Nagų kirpimo mokymas", "Ausų, akių, dantų priežiūra", "Pėdučių apkirpimas", "Maudymo, džiovinimo, šukavimo mokymas", "Dovanos ir nuolaidos"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (
    ID
) DO NOTHING;