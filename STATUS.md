# STATUS — Free Medical Bill Organizer Kit

## What was built

A free, fillable, printable organizer kit for medical-bill and insurance paperwork, built entirely as static HTML/CSS/JS plus Markdown versions. No build step, no account, no tracking, nothing stored online.

**Files**
- `README.md` — kit overview, contents, how to use, license, credit to Asdale Dynamics, LLC, not-billing-advice notice
- `LICENSE` — MIT License, copyright line exactly `Copyright (c) 2026 Asdale Dynamics, LLC`
- `STATUS.md` — this file
- `forms/index.html` — kit hub linking to all five forms and the Markdown folder
- `forms/medical-bill-tracker.html` — bills received, amounts, insurance payments, due dates, payment status
- `forms/insurance-claim-tracker.html` — claims, claim numbers, billed/allowed/paid, denials, appeals
- `forms/eob-review-worksheet.html` — explanation-of-benefits line-by-line review plus checklist
- `forms/payment-plan-tracker.html` — plan terms, monthly payments, due dates, 12-row payment log
- `forms/charity-care-application-tracker.html` — charity-care applications, documents, decisions, follow-ups
- `forms/css/print-forms.css` — shared print styles (@media print hides buttons, sets A4 margins, page-break control)
- `forms/js/forms.js` — "Print this form" button behavior (window.print)
- `markdown/*.md` — plain-text fillable versions of all five forms (tables with blanks and [ ] checkboxes)
- `scripts/verify.js` — static verification run below

**Who it's for:** Anyone tracking medical bills, insurance claims, EOBs, payment plans, or charity-care applications — patients, caregivers, healthcare workers. Created by Asdale Dynamics, LLC (Dylan Asdale, RN turned AI author and founder; Indiana, formed October 2026). Education only, not billing advice.

## How to run

Open any file in `forms/` in a web browser — for example `forms/index.html` for the full kit. Type into fields directly, then click **Print this form** or use the browser print dialog; print styles hide buttons and format for A4 paper. Or print the Markdown files from any text editor / notes app. No install, no internet, no account needed.

## Verification results

Ran `node scripts/verify.js`. ALL CHECKS PASSED:

- All 13 expected files exist (5 HTML forms + index, 5 Markdown forms, README, LICENSE, CSS, JS)
- No `.github/workflows` or other forbidden files
- Every HTML file has `<!doctype html>`, `<html>`, `<head>`, `<body>`, `<title>`
- Every HTML form links the print stylesheet
- All `id` attributes are unique within each document
- Every `<label for>` resolves to an existing id
- Every HTML form credits Asdale Dynamics, LLC and carries the not-billing-advice notice
- All 5 Markdown forms have a heading, the LLC credit, and the disclaimer
- `LICENSE` contains the exact copyright line `Copyright (c) 2026 Asdale Dynamics, LLC`
- `README.md` credits Asdale Dynamics, LLC, includes the copyright line, and references LICENSE
- No obvious secrets or credentials in committed files

Static-only kit: nothing to compile, start, or test beyond the markup checks above. Forms were checked by eye for print layout intent (A4 `@page` margins, `page-break-inside: avoid` on table rows).

## Known gaps

- No automated browser/print rendering test (no Puppeteer/Playwright configured); print output verified by code inspection of `@media print` rules, not by rendering.
- No client-side calculations or totals — all amounts are hand-filled; intentional, keeps the kit simple and dependency-free.
- No data persistence: refreshing loses typed input; print or save-to-PDF to keep records.
- Single-language (English), US-centric insurance terminology (deductible, copay, coinsurance, EOB, prior authorization).
- Markdown versions are static text — no interactive fields.
