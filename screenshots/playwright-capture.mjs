#!/usr/bin/env node
/**
 * Playwright capture script — JobSearch Platform demo screenshots.
 *
 * Prereqs:
 *   1. Docker stack running:   docker compose --profile dev up
 *   2. npm i playwright (once) + npx playwright install chromium
 *
 * Usage:
 *   node playwright-capture.mjs            # capture all shots into ./out
 *   node playwright-capture.mjs --ci        # CI mode: fail on error
 *
 * Output: ./out/*.png  (gitignored)
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.JOBSEARCH_BASE_URL || 'http://localhost:3000'
const OUT_DIR = path.join(__dirname, 'out')

const viewport = { width: 1440, height: 900 }

// ---------- helpers ----------
async function ensureDir() {
  mkdirSync(OUT_DIR, { recursive: true })
}

async function shot(page, name, { fullPage = false } = {}) {
  const target = path.join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path: target, fullPage })
  console.log(`✔ ${name}.png`)
  return target
}

/** Navigate to a path and wait for the MUI app to be interactive (domcontentloaded + small settle) */
async function go(page, path, { timeout = 20000 } = {}) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout })
  // MUI + React hydration needs a beat to render the tree
  await page.waitForTimeout(3000)
}

// ---------- capture flow ----------
async function main() {
  await ensureDir()
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport, locale: 'en-US' })
  const page = await ctx.newPage()

  try {
    // 1) Landing page — not-logged-in home with job listings
    await go(page, '/HomeNotLoggedIn')
    await shot(page, '01-home-not-logged-in', { fullPage: true })

    // 2) Login page
    try {
      await go(page, '/Login')
      await shot(page, '02-login-page')
    } catch { console.error('Skipping 02') }

    // 3) Log in as candidate (eleni.cand@gmail.com)
    try {
      await page.fill('#email', 'eleni.cand@gmail.com')
      await page.fill('#password', 'Passw0rd!123')
      await page.click('button[type="submit"]')
      await page.waitForURL('**/Home**', { timeout: 12000 })
      await page.waitForTimeout(2500)
    } catch (e) {
      console.error('Candidate login failed:', e.message)
    }

    // 4) Home — candidate view
    try { await shot(page, '03-home-candidate', { fullPage: true }) }
    catch { console.error('Skipping 03') }

    // 5) Jobs page with filters
    try {
      await go(page, '/Jobs')
      await shot(page, '04-jobs-page', { fullPage: true })
    } catch { console.error('Skipping 04') }

    // 6) Job Details
    try {
      await go(page, '/Job/201')
      await shot(page, '05-job-details', { fullPage: true })
    } catch { console.error('Skipping 05') }

    // 7) Messages / Chat
    try {
      await go(page, '/Messages')
      await shot(page, '06-messages-page', { fullPage: true })
    } catch { console.error('Skipping 06') }

    // 8) Log out → Log in as employer (maria@techcorp.gr)
    try {
      // Try clearing localStorage to force-logout
      await page.evaluate(() => { localStorage.clear() })
      await go(page, '/Login')
      await page.fill('#email', 'maria@techcorp.gr')
      await page.fill('#password', 'Passw0rd!123')
      await page.click('button[type="submit"]')
      await page.waitForURL('**/Home**', { timeout: 12000 })
      await page.waitForTimeout(2500)
    } catch (e) {
      console.error('Employer login failed:', e.message)
    }

    // 9) Employer Dashboard
    try { await shot(page, '07-employer-dashboard', { fullPage: true }) }
    catch { console.error('Skipping 07') }

    // 10) My Jobs
    try {
      await go(page, '/MyJob')
      await shot(page, '08-my-jobs', { fullPage: true })
    } catch { console.error('Skipping 08') }

    // 11) Applicants
    try {
      await go(page, '/Applicants')
      await shot(page, '09-applicants', { fullPage: true })
    } catch { console.error('Skipping 09') }

    console.log(`\n✔ All done — output: ${OUT_DIR}/`)
  } finally {
    await browser.close()
  }
}

main().catch((e) => {
  console.error('Capture failed:', e)
  process.exit(1)
})