# 📸 Demo Screenshots

Automated demo shots for the **JobSearch Platform** profile section, captured with
[Playwright](https://playwright.dev) in a headless browser.

## Prereqs

```bash
# 1. Start the full Docker stack (MySQL + API + frontend + Adminer)
docker compose --profile dev up --build

# 2. Install Playwright once
cd screenshots
npm i
npx playwright install chromium
```

## Capture

```bash
npm run shot            # -> writes PNGs into ./out/
npm run shot:ci          # CI-friendly: fails on any error
```

Set a custom base URL (e.g. if the app isn't on port 3000):

```bash
JOBSEARCH_BASE_URL=http://localhost:3001 npm run shot
```

## What it captures

| Shot | File | Shows |
|------|------|-------|
| Landing (not logged in) | `01-home-not-logged-in.png` | Public job listings & CTA |
| Login | `02-login-page.png` | Login form with MUI styling |
| Home (candidate) | `03-home-candidate.png` | AI-powered job recommendations |
| Jobs Page | `04-jobs-page.png` | Filterable job listings |
| Job Details | `05-job-details.png` | Full job description + apply |
| Messages/Chat | `06-messages-page.png` | Real-time Socket.io chat UI |
| Employer Dashboard | `07-employer-dashboard.png` | Employer home view |
| My Jobs | `08-my-jobs.png` | Employer job management |
| Applicants | `09-applicants.png` | Candidate pipeline for employer |

## Keeping screenshots in sync (CI)

To auto-refresh shots on every push, add the job to your workflow:

```yaml
- name: Refresh demo screenshots
  run: |
    cd screenshots
    npm ci
    npx playwright install chromium --with-deps
    npm run shot
```

> The `out/` dir is gitignored. Copy the shots you want to keep into `demo/` and commit them there.