// Free Medical Bill Organizer Kit — static verification script
// Checks structure of all HTML forms: required tags, unique ids, label->id references,
// table column widths summing to ~100%, name attributes, credit/disclaimer presence,
// plus LICENSE and README content.
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
  'markdown/index.md',
  'markdown/medical-bill-tracker.md',
  'markdown/insurance-claim-tracker.md',
  'markdown/eob-review-worksheet.md',
  'markdown/payment-plan-tracker.md',
  'markdown/charity-care-application-tracker.md'
];

function read(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf8');
}
function exists(rel) { return fs.existsSync(path.join(root, rel)); }

// 1. Files exist
for (const f of [...expectedHtml, ...expectedMarkdown, 'README.md', 'LICENSE',
                 'forms/css/print-forms.css', 'forms/js/forms.js']) {
  if (!exists(f)) fail('missing file: ' + f);
  else pass('exists: ' + f);
}

// STATUS.md is expected but optional for the check (it's written last)
if (!exists('STATUS.md')) fail('missing file: STATUS.md');
else pass('exists: STATUS.md');

// 2. No forbidden files
const forbidden = ['.github/workflows'];
for (const f of forbidden) {
  if (exists(f)) fail('forbidden file present: ' + f);
  else pass('no forbidden file: ' + f);
}

// 3. HTML structure checks
for (const rel of expectedHtml) {
  const html = read(rel);
  if (!html) continue;

  if (!/<!doctype\s+html/i.test(html)) fail(rel + ': missing <!doctype html>');
  if (!/<html\b/i.test(html)) fail(rel + ': missing <html>');
  if (!/<head\b/i.test(html)) fail(rel + ': missing <head>');
  if (!/<body\b/i.test(html)) fail(rel + ': missing <body>');
  if (!/<title[^>]*>[\s\S]*?<\/title>/i.test(html)) fail(rel + ': missing <title>');
  if (/<!doctype\s+html/i.test(html) && /<html\b/i.test(html) && /<head\b/i.test(html) && /<body\b/i.test(html) && /<title[^>]*>[\s\S]*?<\/title>/i.test(html)) {
    pass(rel + ': basic structure present');
  }

  if (!/print-forms\.css/.test(html)) fail(rel + ': no print stylesheet link');
  else pass(rel + ': print stylesheet linked');

  // Unique ids
  const ids = [];
  let m;
  const idRe = /\bid\s*=\s*"([^"]*)"/gi;
  while ((m = idRe.exec(html))) ids.push(m[1]);
  const dupes = ids.filter((v, i, a) => a.indexOf(v) !== i);
  if (dupes.length) fail(rel + ': duplicate id(s): ' + JSON.stringify([...new Set(dupes)]));
  else pass(rel + ': ' + ids.length + ' unique ids');

  // label for -> existing id (for all labeled elements, not just checkboxes)
  const idSet = new Set(ids);
  const forRe = /\bfor\s*=\s*"([^"]*)"/gi;
  let dangling = 0;
  while ((m = forRe.exec(html))) {
    if (!idSet.has(m[1])) { dangling++; fail(rel + ': label for unknown id "' + m[1] + '"'); }
  }
  if (!dangling && ids.length > 0) pass(rel + ': all label `for` attributes resolve');

  // Every <label> should have a `for` attribute (accessibility)
  const labelRe = /<label[^>]*>/gi;
  let labelsWithoutFor = 0;
  while ((m = labelRe.exec(html))) {
    if (!/\bfor\s*=/.test(m[0])) {
      // skip labels that wrap their input (not used here) - flag it
      labelsWithoutFor++;
      fail(rel + ': label without `for` attribute: ' + m[0].trim().slice(0, 60));
    }
  }
  if (labelsWithoutFor === 0) pass(rel + ': all labels have `for` attribute');

  // Inputs should have name attributes (excluding blank k-fill table cells and checkboxes)
  const inputRe = /<input[^>]*>/gi;
  let inputsWithoutName = 0;
  while ((m = inputRe.exec(html))) {
    if (!/\bname\s*=/.test(m[0]) && !/class="k-fill"/.test(m[0]) && !/type="checkbox"/.test(m[0])) { inputsWithoutName++; }
  }
  if (inputsWithoutName === 0) pass(rel + ': all inputs have `name` attribute');
  else fail(rel + ': ' + inputsWithoutName + ' input(s) missing `name` attribute');

  // Credit + disclaimer
  if (!/Asdale Dynamics, LLC/.test(html)) fail(rel + ': missing Asdale Dynamics, LLC credit');
  else pass(rel + ': Asdale Dynamics, LLC credit present');
  if (!/not billing advice/i.test(html)) fail(rel + ': missing not-billing-advice notice');
  else pass(rel + ': not-billing-advice notice present');

  // Table column widths sum to ~100% per table
  const tableRe = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableCheckOk = true;
  let tableMatch;
  while ((tableMatch = tableRe.exec(html))) {
    const tableContent = tableMatch[1];
    const thRe = /<th[^>]*style="[^"]*width\s*:\s*(\d+)%[^"]*"[^>]*>/g;
    let widthSum = 0;
    let hasWidths = false;
    let tm;
    while ((tm = thRe.exec(tableContent))) {
      widthSum += parseInt(tm[1], 10);
      hasWidths = true;
    }
    if (hasWidths) {
      if (widthSum > 105 || widthSum < 95) {
        fail(rel + ': table column widths sum to ' + widthSum + '% (should be ~100%)');
        tableCheckOk = false;
      }
    }
  }
  if (tableCheckOk) pass(rel + ': table column widths sum to ~100% per table');
}

// 4. Markdown files contain required sections
for (const rel of expectedMarkdown) {
  const md = read(rel);
  if (!md) continue;
  if (!/# /.test(md)) fail(rel + ': missing top-level heading');
  if (!/Asdale Dynamics, LLC/.test(md)) fail(rel + ': missing credit');
  if (!/not billing advice/i.test(md)) fail(rel + ': missing disclaimer');
  if (/# /.test(md) && /Asdale Dynamics, LLC/.test(md) && /not billing advice/i.test(md)) {
    pass(rel + ': heading, credit, disclaimer present');
  }
}

// 5. LICENSE exact copyright line
const license = read('LICENSE');
if (license) {
  if (!license.includes('Copyright (c) 2026 Asdale Dynamics, LLC')) fail('LICENSE: exact copyright line missing');
  else pass('LICENSE: exact copyright line present');
  if (!license.includes('MIT License')) fail('LICENSE: missing MIT License header');
  else pass('LICENSE: MIT License header present');
} else {
  fail('LICENSE: file not found');
}

// 6. README credit + license reference
const readme = read('README.md');
if (readme) {
  if (!/Asdale Dynamics, LLC/.test(readme)) fail('README: missing Asdale Dynamics, LLC credit');
  else pass('README: Asdale Dynamics, LLC credit present');
  if (!/Copyright \(c\) 2026 Asdale Dynamics, LLC/.test(readme)) fail('README: missing copyright line');
  else pass('README: copyright line present');
  if (!/\[LICENSE\]\(LICENSE\)/.test(readme)) fail('README: missing LICENSE reference');
  else pass('README: LICENSE reference present');
} else {
  fail('README: file not found');
}

// 7. No secrets or personal-data-looking content
const secretRe = /(sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|password\s*=\s*"[^"]*")/i;
const allFiles = [...expectedHtml, ...expectedMarkdown, 'README.md', 'LICENSE',
                  'forms/css/print-forms.css', 'forms/js/forms.js'];
if (exists('STATUS.md')) allFiles.push('STATUS.md');
for (const f of allFiles) {
  const content = read(f);
  if (content && secretRe.test(content)) fail(f + ': possible secret or credential present');
}
pass('no obvious secrets or credentials in committed files');

console.log(failures.length ? '\n' + failures.length + ' FAILURE(S)' : '\nALL CHECKS PASSED');
process.exit(failures.length ? 1 : 0);
