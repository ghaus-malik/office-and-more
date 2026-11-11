# Office & More — clickable demo

Frontend-only demo of the full Office & More platform: public website (`/`), customer account (`/espace`) and admin dashboard (`/admin`), all reading one shared browser store. No backend, no real payments, no real emails.

## Run it

```bash
npm install
npm run dev        # development → http://localhost:5173
npm run demo       # production build + offline server → http://localhost:4173
npm test           # store tests: seed figures and the 4 connected moments
```

**Offline backup for the meeting:** run `npm run build` once while online, then `npm run serve` works with no network. Fonts and images are bundled locally.

**Deploy:** upload `dist/` to any static host. `vercel.json` and `public/_redirects` (Netlify) already rewrite every route to `index.html`.

## Demo controls

- **Floating pill** (bottom of the screen): Site · Espace client · Admin · Demo inbox · Reset · Hide. `Shift + D` toggles it.
- **Demo inbox:** every email the platform "sends", rendered as a branded email. Buttons inside the emails work (login link, "see my mail", and so on).
- **Reset:** restores the seed data, so the story can be run again from step 1.

## The 7-step story (click by click)

| Step | Where | Clicks |
| --- | --- | --- |
| 1 | Site | Scroll the home page → **Bureaux** (5 let/reserved greyed, Bureau 5 available) → **Salle de conférence** |
| 2 | Site | **Réserver** → pick a weekday **this week** (so the occupancy tile moves) → **Demi-journée** → Matin or Après-midi → total **CHF 140** → **Continuer vers le paiement** → **Remplir pour la démo** → TWINT → **Payer CHF 140** → confirmation. Email appears in the inbox. |
| 3 | Site | **Domiciliation** → **Choisir Confort** → **Remplir pour la démo** → Continuer → **Remplir pour la démo** → Continuer → **Utiliser un document d’exemple** → Continuer → **Signer pour la démo** + tick the box → Continuer → **Utiliser la carte de démo** → **Payer CHF 199 et souscrire** → **Accéder à mon espace** |
| 4 | Admin | Overview (MRR **CHF 5’364**) → **Salle de conférence** (new booking highlighted green) → **Factures & paiements → Paiements** → **Demandes** → open **Robert Conseil Sàrl** in "Nouvelle" → **Approuver** → MRR **CHF 5’563** (+199) |
| 5 | Admin | **Courrier & domiciliation** → **Remplir pour la démo** (Léa Rochat, Registre du commerce, sample scan) → **Notifier le client** |
| 6 | Espace | Pill → **Espace client** → avatar menu → **Démo : passer au compte de Léa Rochat** → bell → the new letter → scan opens → **Demander la réexpédition** → **Confirmer** |
| 7 | Admin | **Courrier → Réexpéditions** (Léa's request on top) → **Vue d’ensemble**: occupancy, MRR, unpaid invoices with reminders, automations, bexio sync |

Nice-to-have moments also work: change a price in **Paramètres → Services & tarifs** and it shows on the website and in the booking widget; **Envoyer un rappel** on an overdue invoice shows "Rappel envoyé" in the customer's invoices and sends the reminder email.

## Where things live

```
src/
  core/        shared, theme-agnostic kit (ui, data tables, calendars, kanban, flows, layout, demo pill)
  theme/       Office & More logo; colour tokens live in src/index.css (:root)
  data/seed/   all sample data as JSON — dates are relative to today (see loadSeed.ts)
  store/       Zustand store (persisted to localStorage), selectors, connected-moment actions, tests
  emails/      branded email templates
  i18n/        fr/ and en/ dictionaries (typed: a missing EN key fails the build)
  site/ espace/ admin/   the three areas
public/img     brochure visuals (intent images), logo, sample scans, map
public/docs    static sample PDFs (invoice, contract)
```

**Placeholders to confirm with Zulfi** (all in `src/data/seed/`): office sizes and capacities (`offices.json`), scan quotas (`settings.json` → `quotas`), room equipment (`i18n/*/site.ts` → `room.equipment`).
