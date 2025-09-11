-- Insert services for BookitNow.lt training providers
-- This script adds all the training services from the scraped data

-- Dresūros centras Nemirseta services
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
    'dresuros-nemirseta-ivadine-pamoka-id',
    'dresuros-centras-nemirseta-id',
    'training',
    'Įvadinė dresūros pamoka',
    'Išauklėtas ir laimingas šuo! Norint turėti gerą ir paklusnų šunį, reikia jį teisingai išauklėti ir dresuoti. Geriausia pradėti auklėti augintinį nuo pat pirmos jo įsigijimo dienos. Svarbiausia nepamiršti, kad dresūros rezultatai priklauso ir nuo švelnaus žodžio, paglostymo ir palepinimo gardėsiu. Jūsų laukia 1 val. trukmės įvadinė dresūros pamoka. Prieš pradedant dresuoti šuniuką ar dar tik planuojant jį įsigyti naudinga pasirinkti pirminę konsultaciją, kurios metu padedama išsirinkti šuniuko veislę, lytį ir amžių. Šeimininkams, jau turintiems augintinius, įvadinės pamokos metu papasakojama apie pagrindinius dresūros aspektus, tokius kaip šuniuko motyvacija, mitybos režimas, šeimininko elgesio modeliai, tinkami pagiriant šuniuką už nepriekaištingai atliktą veiksmą ar elgesio korekciją augintiniui atlikus nepageidaujamą poelgį. Pamokos metu įvertinama šuniuko nervų sistema, charakterio savybės, padedama nustatyti koreguotinus šuniuko įpročius ir elgesį. Konsultuojama visais klausimais, susijusiais su šunų auginimu, priežiūra ir dresūra. Pasinaudokite galimybe dar geriau pažinti savo šunį!',
    50.00,
    60, -- 1 val.
    1,
    '["Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Įvadinė konsultacija", "Šuniuko veislės pasirinkimas", "Dresūros aspektų paaiškinimas", "Nervų sistemos įvertinimas", "Charakterio savybių analizė", "Elgesio korekcijos planas", "Konsultacijos visais klausimais"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
 
-- Dresūros centras Palanga services
(
    'dresuros-palanga-ivadine-pamoka-id',
    'dresuros-centras-palanga-id',
    'training',
    'Įvadinė dresūros pamoka',
    'Išauklėtas ir laimingas šuo! Norint turėti gerą ir paklusnų šunį, reikia jį teisingai išauklėti ir dresuoti. Geriausia pradėti auklėti augintinį nuo pat pirmos jo įsigijimo dienos. Svarbiausia nepamiršti, kad dresūros rezultatai priklauso ir nuo švelnaus žodžio, paglostymo ir palepinimo gardėsiu. Jūsų laukia 1 val. trukmės įvadinė dresūros pamoka. Prieš pradedant dresuoti šuniuką ar dar tik planuojant jį įsigyti naudinga pasirinkti pirminę konsultaciją, kurios metu padedama išsirinkti šuniuko veislę, lytį ir amžių. Šeimininkams, jau turintiems augintinius, įvadinės pamokos metu papasakojama apie pagrindinius dresūros aspektus, tokius kaip šuniuko motyvacija, mitybos režimas, šeimininko elgesio modeliai, tinkami pagiriant šuniuką už nepriekaištingai atliktą veiksmą ar elgesio korekciją augintiniui atlikus nepageidaujamą poelgį. Pamokos metu įvertinama šuniuko nervų sistema, charakterio savybės, padedama nustatyti koreguotinus šuniuko įpročius ir elgesį. Konsultuojama visais klausimais, susijusiais su šunų auginimu, priežiūra ir dresūra. Pasinaudokite galimybe dar geriau pažinti savo šunį!',
    50.00,
    60, -- 1 val.
    1,
    '["Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Įvadinė konsultacija", "Šuniuko veislės pasirinkimas", "Dresūros aspektų paaiškinimas", "Nervų sistemos įvertinimas", "Charakterio savybių analizė", "Elgesio korekcijos planas", "Konsultacijos visais klausimais"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
 
-- Fracco dresūros mokykla services
(
    'fracco-nuotolinis-seminaras-suniukas-id',
    'fracco-dresuros-mokykla-id',
    'training',
    'Nuotolinis seminaras „SOS: namuose mažas šuniukas"',
    'Valandos trukmės nuotolinis seminaras apie jaunų šuniukų auginimą. Namuose turite mažą šuniuką, o gal tik planuojate jį įsigyti? Tuomet jums tikrai patiks šis seminaras apie mažų šuniukų auklėjimą ir taisyklių nustatymą namuose. Šio valandos trukmės seminaro metu sužinosite, nuo ko reikėtų pradėti augintinio dresūrą, kaip išmokyti „reikalus" atlikti lauke, kada pradėti mokyti šuniuką naujų dalykų, ir t.t. Įsigiję paslaugos čekį, gausite nuorodą, kurią paspaudę galėsite peržiūrėti seminarą jums patogiausiu metu.',
    15.00,
    60, -- 1 val.
    1,
    '["Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Nuotolinis seminaras", "Jaunų šuniukų auginimo patarimai", "Dresūros pradžios gairės", "Taisyklių nustatymas namuose", "Praktiniai patarimai", "Galimybė peržiūrėti bet kuriuo metu"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'fracco-individuali-dresuros-pamoka-id',
    'fracco-dresuros-mokykla-id',
    'training',
    'Individuali dresūros pamoka',
    'Fracco dresūros mokykloje šeimininkai mokysis tinkamai komunikuoti su šunimis, o šuniukai – suprasti, ko iš jų tikisi šeimininkai. Laukiami ir jauni šuniukai, gavę privalomus skiepus, ir suaugę šunys, kuriems reikia išspręsti tam tikras elgsenos problemas. Pamokos vyksta lauko sąlygomis, o esant nepalankiems orams galėsime pasislėpti po stogu ir mokytis dėmesio koncentracijos ir kitų pratimų. Dresūros mokyklos patalpose taip pat yra savaeigis bėgimo takelis – šuniukai galės pasimankštinti ir pagerinti savo išvystomo greičio rekordą. Pamokoje dalyvauja 1 šuo su savo šeimininku (-ais). Pamokos laikas derinamas iš anksto individualiai.',
    27.00,
    60, -- 1 val.
    1,
    '["Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Individuali pamoka", "Komunikacijos mokymas", "Lauko sąlygos", "Dėmesio koncentracijos pratimai", "Savaeigis bėgimo takelis", "Individualus laiko derinimas"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'fracco-nuotolinis-seminaras-pavadele-id',
    'fracco-dresuros-mokykla-id',
    'training',
    'Nuotolinis seminaras „SOS: šuo tempia pavadėlį"',
    'Pasivaikščiojimų su šunimi metu jaučiatės taip, tarsi tiesiog laikytumėte savo augintinio pavadėlį, o jūsų mylimas Bimas gyvena visiškai atskirą gyvenimą? Tuomet šis seminaras kaip tik jums. Šiame 40 minučių nuotoliniame seminare gausite daug naudingos informacijos, kurią galėsite pritaikyti praktikoje. Nuotolinį seminarą galėsite peržiūrėti bet kuriuo jums patogiu metu – elektroniniu paštu gausite unikalią seminaro nuorodą.',
    15.00,
    40, -- 40 min.
    1,
    '["Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš"]',
    '["Nuotolinis seminaras", "Pavadėlio tempimo problemos sprendimas", "Praktiniai patarimai", "Galimybė peržiūrėti bet kuriuo metu", "Unikali seminaro nuoroda"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
 
-- Reksas - Šunų pamokos Vilniuje services
(
    'reksas-konsultacija-elgesys-id',
    'reksas-sunu-pamokos-id',
    'training',
    'Konsultacija dėl šuns elgesio (1 asm.)',
    'Tavęs laukia 1 val. trukmės konsultacija dėl šuns elgesio. Ši paslauga tinkama vyresnių nei 6 mėn. amžiaus šunų šeimininkams, pastebintiems, kad jų šuniukai turi stipriai išreikštą baimę, agresiją ar nerimą, t. y. loja, puola, gąsdina kitus šunis, tempia pavadėlį, vengia žmonių, kaukia pasilikę vieni ar kitu būdu pernelyg stipriai reaguoja į pašalinius dirgiklius. Konsultacija padeda suprasti problemų, su kuriomis susiduria šuniukas, priežastis ir pabandyti jas išspręsti.',
    60.00,
    60, -- 1 val.
    1,
    '["Šunys vyresni nei 6 mėn.", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš", "Už 30 Eur priemoką galimas atvykimas į namus Vilniaus mieste"]',
    '["Elgesio problemų analizė", "Baimės ir agresijos sprendimas", "Pavadėlio tempimo korekcija", "Socializacijos patarimai", "Dirgiklių reakcijos korekcija", "Galimybė atvykti į namus"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
),
(
    'reksas-jauno-suniuko-auklejimas-id',
    'reksas-sunu-pamokos-id',
    'training',
    'Jauno šuniuko auklėjimo pamoka (1 asm.)',
    'Tavęs laukia 1 val. trukmės jauno šuniuko auklėjimo pamoka. Ši paslauga tinkama šuniukų iki 6 mėn. amžiaus šeimininkams. Konsultacijos metu bus aiškinamos pagrindinės šunų auklėjimo taisyklės – kaip išmokyti šuniuką nesišlapinti ir nesituštinti namuose, nesikandžioti, negraužti baldų, gražiai vaikščioti su pavadėliu, nešokinėti, ramiai elgtis pasilikus be šeimininko ir kt. Tai puiki galimybė išmokti teisingai subalansuoti šuniukui tenkantį fizinį ir psichologinį krūvį, kad jis būtų sveikas ir laimingas!',
    50.00,
    60, -- 1 val.
    1,
    '["Šuniukai iki 6 mėn.", "Būtina išankstinė registracija", "Apie neatvykimą pranešti 24 val. prieš", "Už 30 Eur priemoką galimas atvykimas į namus Vilniaus mieste"]',
    '["Pagrindinės auklėjimo taisyklės", "Nesišlapinimo mokymas", "Kandžiojimo prevencija", "Pavadėlio mokymas", "Šokinėjimo korekcija", "Atskyrimo nerimo sprendimas", "Fizinio ir psichologinio krūvio balansas", "Galimybė atvykti į namus"]',
    '[]',
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (
    ID
) DO NOTHING;