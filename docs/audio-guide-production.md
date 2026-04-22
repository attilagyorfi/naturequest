# NatureQuest Audio Guide Production Pack

Ez a dokumentum a NatureQuest kuldetesekhez tartozo elso audio guide csomag teljes gyartasi listaja. A cel az, hogy a fajlok egy az egyben betehetok legyenek a `public/audio` mappaba, es a jelenlegi alkalmazas automatikusan megjelenitse a lejatszot a kuldetesoldalon.

## Exportalas

- Formatum: `mp3`
- Mintavetel: `44.1 kHz`
- Bitrata: `128 kbps` vagy jobb
- Csatorna: mono vagy stereo
- Hangero cel: tiszta, torzitasmentes, egyenletes beszedhang
- Zajszint: lehetoseg szerint minimalis hatterzaj

## Elhelyezes

Az osszes fajlt ide kell menteni:

- `public/audio/`

Pontosan ezekkel a fajlnevekkel:

1. `erdei-nyomkereso-intro.mp3`
2. `varosi-tortenelmi-seta-guide.mp3`
3. `mese-es-helyszin-guide.mp3`
4. `mini-piac-kaland-guide.mp3`

## Altalanos felmondasi irany

- Hangnem: nyugodt, biztato, gyerekbarat
- Tempo: kozepesen lassu, jol kovetheto
- Hossz: kb. 20-35 masodperc / guide
- Stilus: egyszeru, tiszta mondatok, tul sok jatekoskodas nelkul
- Cel: rahangolni a kuldetesre, nem pedig elmagyarazni helyette az osszes lepest

---

## 1. Erdei nyomkereso

- Fajlnev: `erdei-nyomkereso-intro.mp3`
- Kapcsolodo kuldetes slug: `erdei-nyomkereso`
- Cel: raallitani a figyelmet a termeszet jeleire
- Ideal hosszusag: 25-30 masodperc

### Vegleges narracios szoveg

Figyelj a hangokra, a formakra es az apro reszletekre. Ne siess. Nezd meg, milyen nyomokat hagy maga utan a termeszet a leveleken, a fakergen, a talajon vagy eppen a levegoben. A kuldetes soran nem a gyorsasag szamit, hanem az, hogy eszrevedd azt is, ami mellett maskor talan elsetalnal.

### Rogzitesi megjegyzes

- Hangulat: csendes, kivancsi, megfigyelo
- Javasolt hangsuly: `Ne siess.` es `nem a gyorsasag szamit`

---

## 2. Varosi tortenelmi seta

- Fajlnev: `varosi-tortenelmi-seta-guide.mp3`
- Kapcsolodo kuldetes slug: `varosi-tortenelmi-seta`
- Cel: megmutatni, hogy a varosi reszletek torteneteket rejtenek
- Ideal hosszusag: 25-35 masodperc

### Vegleges narracios szoveg

Amikor megnezel egy regi epuletet, szobrot vagy emlekhelyet, probalj ne csak ranezni, hanem olvasni is belole. Figyeld meg a datumokat, a neveket, a diszeket es az apro jelzeseket. Ezek a reszletek segitenek felfedezni, milyen tortenetek zajlottak ugyanitt sok evvel ezelott.

### Rogzitesi megjegyzes

- Hangulat: felfedezo, kicsit unnepelyes
- Javasolt hangsuly: `olvasni is belole` es `milyen tortenetek zajlottak ugyanitt`

---

## 3. Mese es helyszin

- Fajlnev: `mese-es-helyszin-guide.mp3`
- Kapcsolodo kuldetes slug: `mese-es-helyszin`
- Cel: osszekotni a kepzeletet a valos kornyezettel
- Ideal hosszusag: 20-30 masodperc

### Vegleges narracios szoveg

Hasznald a kepzeletedet, de kozben figyelj a valos reszletekre is. Egy jo helyszin attol lesz izgalmas, hogy erezni lehet benne a tortenet hangulatat. Ne csak azt keresd, mi szep vagy kulonleges, hanem azt is, melyik hely illik legjobban ahhoz a vilaghoz, amit olvastal vagy elkepzeltel.

### Rogzitesi megjegyzes

- Hangulat: kreativ, meleg, inspiralo
- Javasolt hangsuly: `a valos reszletekre is` es `a tortenet hangulatat`

---

## 4. Mini piac kaland

- Fajlnev: `mini-piac-kaland-guide.mp3`
- Kapcsolodo kuldetes slug: `mini-piac-kaland`
- Cel: egyszeru dontesi szempontokra iranyitani a figyelmet
- Ideal hosszusag: 25-35 masodperc

### Vegleges narracios szoveg

Vasarlasnal nem mindig a legolcsobb termek a legjobb valasztas. Gondold at, mire van szukseged, mennyit er neked az adott dolog, es milyen lehetosegek kozul valaszthatsz. Ebben a kuldetesben az a fontos, hogy meg tudd indokolni a dontesedet, es latszodjon, hogyan gondolkodtal.

### Rogzitesi megjegyzes

- Hangulat: baratsagos, tiszta, tanito jellegu
- Javasolt hangsuly: `nem mindig a legolcsobb` es `meg tudd indokolni a dontesedet`

---

## Gyartasi ellenorzo lista

1. A 4 MP3 fajl elkeszult a fenti nevekkel.
2. Mind a 4 fajl bekerult a `public/audio` mappaba.
3. A quest reszletoldalon megjelent a lejatszo.
4. Minden audio elindul bongeszobol.
5. Mobil nezettel is ellenorizve lett, hogy a lejatszo nem torik szet.

## Gyors teszteles

Miutan a fajlok a helyukre kerultek, ezt erdemes lefuttatni:

```bash
corepack pnpm run test:naturequest
corepack pnpm run lint
corepack pnpm run build
```

Ezutan bongeszoben nyisd meg a kuldetesoldalakat, es ellenorizd, hogy a `Felkeszules` blokkban a szoveg mellett mar az audio lejatszo is megjelenik.
