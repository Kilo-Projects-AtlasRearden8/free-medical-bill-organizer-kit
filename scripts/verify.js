// Free Medical Bill Organizer Kit — static verification script
// Checks structure of all HTML forms: required tags, unique ids, label->id references,
// credit/disclaimer presence, plus LICENSE and README content.
// Exit code 1 on any failure.

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];
function fail(msg) { failures.push(msg); console.error('FAIL: ' + msg); }
function pass(msg) { console.log('ok - ' + msg); }

const expectedHtml = [
  'forms/index.html',
  'forms/medical-bill-tracker.html',
  'forms/insurance-claim-tracker.html',
  'forms/eob-review-worksheet.html',
  'forms/payment-plan-tracker.html',
  'forms/charity-care-application-tracker.html'
];
const expectedMarkdown = [
  'markdown/medical-bill-tracker.md',
  'markdown/insurance-claim-tracker.md',
  'markdown/eob-review-worksheet.md',
  'markdown/payment-plan-tracker.md',
  'markdown/charity-care-application-tracker.md'
];

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }

// 1. Files exist
for (const f of [...expectedHtml, ...expectedMarkdown, 'README.md', 'LICENSE', 'STATUS.md',
                 'forms/css/print-forms.css', 'forms/js/forms.js']) {
  if (!fs.existsSync(path.join(root, f))) fail('missing file: ' + f);
  else pass('exists: ' + f);
}

// 2. No forbidden files
const forbidden = ['.github/workflows'];
for (const f of forbidden) {
  if (fs.existsSync(path.join(root, f))) fail('forbidden file present: ' + f);
  else pass('no forbidden file: ' + f);
}

// 3. HTML structure checks
function attrRegex(tagAttr) { return new RegExp(tagAttr + '\\s*=\\s*"([^"]*)"', 'g'); }

for (const rel of expectedHtml) {
  const html = read(rel);
  const lower = html.toLowerCase();

  if (!/<!doctype\s+html/i.test(html)) fail(rel + ': missing <!doctype html>');
  else pass(rel + ': doctype present');

  if (!/<html\b/i.test(html)) fail(rel + ': missing <html>');
  if (!/<head\b/i.test(html)) fail(rel + ': missing <head>');
  if (!/<body\b/i.test(html)) fail(rel + ': missing <body>');
  if (!/<title[^>]*>[\s\S]*?<\/title>/i.test(html)) fail(rel + ': missing <title>');
  else pass(rel + ': basic structure present');

  if (!/media\s*=\s*"print"/.test(html) && !/print-forms\.css/.test(html)) fail(rel + ': no print stylesheet link');

  // Unique ids
  const ids = [];
  let m;
  const idRe = /\bid\s*=\s*"([^"]*)"/gi;
  while ((m = idRe.exec(html))) ids.push(m[1]);
  const dupes = ids.filter((v, i, a) => a.indexOf(v) !== i);
  if (dupes.length) fail(rel + ': duplicate id(s): ' + JSON.stringify([...new Set(dupes)]));
  else pass(rel + ': ' + ids.length + ' unique ids');

  // label for -> existing id
  const idSet = new Set(ids);
  const forRe = /\bfor\s*=\s*"([^"]*)"/gi;
  let dangling = 0;
  while ((m = forRe.exec(html))) {
    if (!idSet.has(m[1])) { dangling++; fail(rel + ': label for unknown id "' + m[1] + '"'); }
  }
  if (!dangling) pass(rel + ': all label `for` attributes resolve');

  // Credit + disclaimer
  if (!/Asdale Dynamics, LLC/.test(html)) fail(rel + ': missing Asdale Dynamics, LLC credit');
  if (!/education only[^.]*not billing advice/i.test(html) && !/not billing advice/i.test(html)) fail(rel + ': missing not-billing-advice notice');
}

// 4. Markdown files contain required sections
for (const rel of expectedMarkdown) {
  const md = read(rel);
  if (!/# /.test(md)) fail(rel + ': missing top-level heading');
  if (!/Asdale Dynamics, LLC/.test(md)) fail(rel + ': missing credit');
  if (!/not billing advice/i.test(md)) fail(rel + ': missing disclaimer');
  pass(rel + ': heading, credit, disclaimer present');
}

// 5. LICENSE exact copyright line
const license = read('LICENSE');
if (!license.includes('Copyright (c) 2026 Asdale Dynamics, LLC')) fail('LICENSE: exact copyright line missing');
else pass('LICENSE: exact copyright line present');
if (!license.includes('MIT License')) fail('LICENSE: missing MIT License header');

// 6. README credit + license reference
const readme = read('README.md');
if (!/Asdale Dynamics, LLC/.test(readme)) fail('README: missing Asdale Dynamics, LLC credit');
if (!/Copyright \(c\) 2026 Asdale Dynamics, LLC/.test(readme)) fail('README: missing copyright line');
if (!/\[LICENSE\]\(LICENSE\)/.test(readme)) fail('README: missing LICENSE reference');
pass('README: credit, copyright line, license reference present');

// 7. No secrets or personal-data-looking content
const secretRe = /(sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|password\s*=\s*"[^"]*")/i;
for (const f of [...expectedHtml, ...expectedMarkdown, 'README.md', 'LICENSE', 'STATUS.md', 'forms/css/print-forms.css', 'forms/js/forms.js']) {
  const content = read(f);
  if (secretRe.test(content)) fail(f + ': possible secret or credential present');
}
pass('no obvious secrets or credentials in committed files');

console.log(failures.length ? '\n' + failures.length + ' FAILURE(S)' : '\nALL CHECKS PASSED');
process.exit(failures.length ? 1 : 0);
