# Talk with Julia — מדברים עם ג'וליה

A phone app (PWA) to get a Hebrew-speaking 4th grader ready for a basic
conversation with her aunt from the USA, who arrives on 18.12.

## How it works
- **8 stops + a final mission** (Hello · help words · about me · family · I like · feelings · questions for Julia · together · *the big day at the airport*).
- Each stop has 2 short "new phrases" lessons and a **role-play chat with Julia**. She speaks, the child answers by tapping or speaking, then says the answer out loud.
- **Personal**: the onboarding collects real answers (name, age, city, siblings, favourite color/animal/food/hobby), so she practises sentences about herself.
- **Hebrew transliteration** (e.g. "נייס טו מיט יו") for units 1–4, then it fades to tap-to-reveal.
- **Lenient speech recognition**: word-level fuzzy matching, names ignored, two tries max, and an "I said it!" fallback when there is no mic.
- **Spaced review** (Leitner 1/2/4/7/14 days), streak, stars, passport stamps, and a countdown with Julia's plane flying to Israel.
- **My phrasebook**: every learned phrase, tap to hear. Useful during the visit.
- **Parent area**: progress, last 7 days, profile, arrival date, voice speed, mic test.

## Run / test
```
python -m http.server 8765        # then open http://localhost:8765
npm test                          # node:test + coverage
```
No build step. Deploy any static host (GitHub Pages). Bump `CACHE` in `sw.js` on each release.

Best on Chrome (Android) or Safari (iPhone). On iPhone the microphone works more reliably
in a Safari tab than from the home-screen icon.
