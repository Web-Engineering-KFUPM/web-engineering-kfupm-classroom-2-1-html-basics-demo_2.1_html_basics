// Autograder for "2.1 HTML Basics" (structure-focused, extra-flexible)
// Sections (75 pts auto): TODOs 25, Correctness 25, Code Quality 25
// Submission Time (0–25): on-time = 25, late = 12.5 (half credit)
//
// ENV VARS:
//   HTML_FILE (default: index.html)
//   SUBMISSION_POINTS (optional numeric override 0..25; if LATE, capped at 12.5)
//   LATE_SUBMISSION ("1"/"true" => late) OR SUBMISSION_STATUS ("late"|"on-time")
//
// Notes:
// - Text/content keywords are ignored. We only require structural presence
//   and that list items aren't empty (to ensure students actually added items).
// - Very forgiving: case, spacing, and specific words are NOT required.

import { access, readFile, writeFile } from 'fs/promises';
import { constants as FS } from 'fs';
import { load } from 'cheerio';

const HTML_FILE = process.env.HTML_FILE || 'index.html';
const SUBMISSION_POINTS_ENV = process.env.SUBMISSION_POINTS;
const SUBMISSION_POINTS_NUM = Number.isFinite(Number(SUBMISSION_POINTS_ENV))
  ? Number(SUBMISSION_POINTS_ENV)
  : null;

const isLate =
  String(process.env.LATE_SUBMISSION || '').toLowerCase() === '1' ||
  String(process.env.LATE_SUBMISSION || '').toLowerCase() === 'true' ||
  String(process.env.SUBMISSION_STATUS || '').toLowerCase() === 'late';

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// --- minimal helpers to replace fs-extra ---
async function pathExists(p) {
  try { await access(p, FS.F_OK); return true; } catch { return false; }
}
async function writeJson(path, obj, opts = {}) {
  const spaces = typeof opts.spaces === 'number' ? opts.spaces : 0;
  await writeFile(path, JSON.stringify(obj, null, spaces));
}

// build result rows
function resultRow(id, desc, pass, pts) {
  return { id, desc, pass: !!pass, ptsEarned: pass ? pts : 0, ptsMax: pts };
}

// count direct <li> with non-empty text (ignores exact content/keywords)
function countDirectLiWithText($, $ul) {
  let count = 0;
  $ul.find('> li').each((_, li) => {
    const txt = ($(li).text() || '').replace(/\s+/g, ' ').trim();
    if (txt.length > 0) count++;
  });
  return count;
}

function grade(html) {
  const $ = load(html, { decodeEntities: false });

  const $tables = $('table');
  const $firstTable = $tables.first();
  const $imgs = $('img');
  const $firstImg = $imgs.first();

  // ===== TODOs Completion (25 pts) =====
  const todoChecks = [];
  todoChecks.push(resultRow('h1_present', 'Has an <h1> element', $('h1').length >= 1, 5));
  todoChecks.push(resultRow('h2_present', 'Has an <h2> element', $('h2').length >= 1, 4));
  todoChecks.push(resultRow('p_present', 'Has at least one <p>', $('p').length >= 1, 4));
  todoChecks.push(resultRow('p_strong', 'Has a <p> with <strong> inside', $('p strong').length >= 1, 3));
  todoChecks.push(resultRow('p_em', 'Has a <p> with <em> inside', $('p em').length >= 1, 3));
  todoChecks.push(resultRow('p_mark', 'Has a <p> with <mark> inside', $('p mark').length >= 1, 3));
  // flexible: at least two <h3> (no specific text required)
  todoChecks.push(resultRow('two_h3', 'Has at least two <h3> sections', $('h3').length >= 2, 1.5));
  // presence markers
  todoChecks.push(resultRow('table_present', 'Has a <table>', $tables.length >= 1, 0));
  todoChecks.push(resultRow('img_present', 'Has an <img>', $imgs.length >= 1, 0));

  const todoScore = todoChecks.reduce((s, r) => s + r.ptsEarned, 0);
  const todoMax = todoChecks.reduce((s, r) => s + r.ptsMax, 0);
  const TODO_WEIGHT = 25;
  const todoScaled = Math.round((todoScore / todoMax) * TODO_WEIGHT * 100) / 100;

  // ===== Correctness of Output (25 pts) =====
  // Extra-flexible lists:
  // 1) "Course Topics": any <ul> with ≥ 3 direct <li> that have non-empty text.
  // 2) "Web Technologies": ensure students made a list with items that look like technologies:
  //    any <ul> with ≥ 3 direct <li> (non-empty), and ideally associated with a nearby <h3>.
  const corrChecks = [];

  // (1) Any UL with >= 3 direct non-empty LI
  const anyUlWith3TextItems = $('ul').toArray().some(ul => {
    return countDirectLiWithText($, $(ul)) >= 3;
  });
  corrChecks.push(
    resultRow(
      'ul_min3_items',
      'Has a <ul> with ≥ 3 direct non-empty <li>',
      anyUlWith3TextItems,
      6 // give this a bit more weight since it covers "Course Topics" flexibly
    )
  );

  // (2) A UL colocated with an H3 (common pattern students will use)
  // Find any <h3> whose next sibling UL has ≥ 3 direct non-empty LI
  let h3UlWith3Ok = false;
  $('h3').each((_, h3) => {
    const $h3 = $(h3);
    const $nextUl = $h3.nextAll('ul').first();
    if ($nextUl.length && countDirectLiWithText($, $nextUl) >= 3) {
      h3UlWith3Ok = true;
    }
  });
  corrChecks.push(
    resultRow(
      'h3_followed_by_ul_min3',
      'An <h3> is followed by a <ul> with ≥ 3 items',
      h3UlWith3Ok,
      6
    )
  );

  // Keep table checks (structure only; no header text requirements)
  let theadHeadersOk = false, tbodyRowsOk = false;
  if ($firstTable.length) {
    const thCount = $firstTable.find('thead th').length;
    theadHeadersOk = thCount >= 4;
    tbodyRowsOk = $firstTable.find('tbody tr').length >= 2;
  }
  corrChecks.push(resultRow('table_headers', 'Table <thead> has ≥ 4 <th>', theadHeadersOk, 6));
  corrChecks.push(resultRow('table_rows', 'Table <tbody> has ≥ 2 rows', tbodyRowsOk, 5));

  // Image numeric width & height
  const intAttr = ($el, name) => {
    const v = ($el.attr(name) || '').trim();
    const n = Number(v);
    return Number.isFinite(n);
  };
  const widthOk = $firstImg.length ? intAttr($firstImg, 'width') : false;
  const heightOk = $firstImg.length ? intAttr($firstImg, 'height') : false;
  corrChecks.push(resultRow('img_wh', 'Image has numeric width & height', widthOk && heightOk, 2));

  const corrScore = corrChecks.reduce((s, r) => s + r.ptsEarned, 0);
  const corrMax = corrChecks.reduce((s, r) => s + r.ptsMax, 0);
  const CORR_WEIGHT = 25;
  const corrScaled = Math.round((corrScore / corrMax) * CORR_WEIGHT * 100) / 100;

  // ===== Code Quality (25 pts) =====
  const qualChecks = [];
  const hasDoctype = /^<!doctype html>/i.test(html.trim());
  qualChecks.push(resultRow('doctype', 'Uses <!DOCTYPE html> at top', hasDoctype, 4));
  const htmlEl = $('html');
  const langAttr = (htmlEl.attr('lang') || '').trim();
  qualChecks.push(resultRow('lang', '<html> has lang attribute', langAttr.length > 0, 4));
  const hasCharset =
    $('meta[charset], meta[http-equiv="Content-Type"][content*="charset"]').length > 0;
  qualChecks.push(resultRow('charset', 'Has <meta charset> (or equivalent)', hasCharset, 4));
  const titleTxt = ($('head title').first().text() || '').trim();
  qualChecks.push(resultRow('title', '<title> is present & non-empty', titleTxt.length > 0, 3));
  let nestedUnderLiOk = true;
  $('ul > ul, ol > ul, ul > ol, ol > ol').each(() => { nestedUnderLiOk = false; });
  qualChecks.push(resultRow('list_nesting', 'Nested lists are inside <li>', nestedUnderLiOk, 5));
  const hasThead = $firstTable.length ? $firstTable.find('thead').length > 0 : false;
  const hasTbody = $firstTable.length ? $firstTable.find('tbody').length > 0 : false;
  qualChecks.push(resultRow('thead_tbody', 'Table uses <thead> and <tbody>', hasThead && hasTbody, 5));
  const altOk = $firstImg.length ? (($firstImg.attr('alt') || '').trim().length > 0) : false;
  qualChecks.push(resultRow('img_alt', 'Image has non-empty alt text', altOk, 4));

  const qualScore = qualChecks.reduce((s, r) => s + r.ptsEarned, 0);
  const qualMax = qualChecks.reduce((s, r) => s + r.ptsMax, 0);
  const QUAL_WEIGHT = 25;
  const qualScaled = Math.round((qualScore / qualMax) * QUAL_WEIGHT * 100) / 100;

  // ===== Submission Time (25 pts) =====
  let submissionPts;
  if (SUBMISSION_POINTS_NUM !== null) {
    submissionPts = clamp(SUBMISSION_POINTS_NUM, 0, 25);
    if (isLate) submissionPts = Math.min(submissionPts, 12.5);
  } else {
    submissionPts = isLate ? 12.5 : 25;
  }

  const autoScore75 = clamp(todoScaled + corrScaled + qualScaled, 0, 75);
  const finalScore100 = autoScore75 + submissionPts;

  const rowsMd = (arr) =>
    arr.map(r => `| ${r.pass ? '✅' : '❌'} | ${r.desc} | ${r.ptsEarned.toFixed(2)} / ${r.ptsMax} |`).join('\n');

  const md = `# Automated Grade: 2.1 HTML Basics (Structure-Focused, Extra-Flexible)

**Automatic Score (out of 75):** **${autoScore75.toFixed(2)} / 75**

- TODOs Completion (25): **${todoScaled.toFixed(2)}**
- Correctness of Output (25): **${corrScaled.toFixed(2)}**
- Code Quality (25): **${qualScaled.toFixed(2)}**

**Submission Time (out of 25):** ${submissionPts} ${isLate ? '(late: half credit)' : '(on-time)'}

**Final Score (out of 100):** **${finalScore100.toFixed(2)} / 100**

---

## TODOs Completion (25)
| Result | Check | Points |
|---|---|---|
${rowsMd(todoChecks)}

## Correctness of Output (25)
| Result | Check | Points |
|---|---|---|
${rowsMd(corrChecks)}

## Code Quality (25)
| Result | Check | Points |
|---|---|---|
${rowsMd(qualChecks)}

**Notes:**
- Ignores specific keywords inside tags; only requires non-empty list items.
- Structure is emphasized: presence, counts, and valid nesting.
- If your main file isn’t \`${HTML_FILE}\`, set \`HTML_FILE\` in the workflow.
`;

  const jsonReport = {
    auto_score_out_of_75: autoScore75,
    todo_scaled: todoScaled,
    correctness_scaled: corrScaled,
    quality_scaled: qualScaled,
    submission_points_out_of_25: submissionPts,
    final_score_out_of_100: finalScore100,
    is_late_submission: isLate,
    details: { todos: todoChecks, correctness: corrChecks, quality: qualChecks }
  };

  const csv = `repo,auto_score_75,submission_25,final_100
${process.env.GITHUB_REPOSITORY || 'repo'},${autoScore75.toFixed(2)},${submissionPts},${finalScore100.toFixed(2)}
`;

  return { md, jsonReport, csv };
}

async function main() {
  const exists = await pathExists(HTML_FILE);
  const fallback = isLate ? 12.5 : 25;

  if (!exists) {
    const subPts = SUBMISSION_POINTS_NUM !== null
      ? (isLate ? Math.min(clamp(SUBMISSION_POINTS_NUM, 0, 25), 12.5) : clamp(SUBMISSION_POINTS_NUM, 0, 25))
      : fallback;

    const md = `# Automated Grade: 2.1 HTML Basics (Structure-Focused, Extra-Flexible)

**Status:** ❌ Could not find \`${HTML_FILE}\`.

**Automatic Score (out of 75):** 0.00 / 75  
**Submission Time (out of 25):** ${subPts} ${isLate ? '(late: half credit)' : '(on-time)'}  
**Final Score (out of 100):** ${subPts.toFixed(2)} / 100

> Ensure your main HTML file is named \`index.html\` at the repo root (or set \`HTML_FILE\`).
`;
    await writeFile('GRADE.md', md);
    await writeJson('grade_report.json', { error: `Missing ${HTML_FILE}`, auto_score_out_of_75: 0, submission_points_out_of_25: subPts, final_score_out_of_100: subPts }, { spaces: 2 });
    await writeFile('grade_report.csv', `repo,auto_score_75,submission_25,final_100\n${process.env.GITHUB_REPOSITORY || 'repo'},0,${subPts},${subPts}\n`);
    return;
  }

  const html = await readFile(HTML_FILE, 'utf8');
  const { md, jsonReport, csv } = grade(html);

  await writeFile('GRADE.md', md);
  await writeJson('grade_report.json', jsonReport, { spaces: 2 });
  await writeFile('grade_report.csv', csv);
}

main().catch(async (e) => {
  const fallback = isLate ? 12.5 : 25;
  const subPts = SUBMISSION_POINTS_NUM !== null
    ? (isLate ? Math.min(clamp(SUBMISSION_POINTS_NUM, 0, 25), 12.5) : clamp(SUBMISSION_POINTS_NUM, 0, 25))
    : fallback;

  await writeFile('GRADE.md', `# Automated Grade: 2.1 HTML Basics (Structure-Focused, Extra-Flexible)

**Status:** ❌ Autograder crashed.

\`\`\`
${e.stack || e.message}
\`\`\`

**Automatic Score (out of 75):** 0.00 / 75  
**Submission Time (out of 25):** ${subPts} ${isLate ? '(late: half credit)' : '(on-time)'}  
**Final Score (out of 100):** ${subPts.toFixed(2)} / 100
`);
  await writeJson('grade_report.json', { error: e.message, auto_score_out_of_75: 0, submission_points_out_of_25: subPts, final_score_out_of_100: subPts }, { spaces: 2 });
  await writeFile('grade_report.csv', `repo,auto_score_75,submission_25,final_100\n${process.env.GITHUB_REPOSITORY || 'repo'},0,${subPts},${subPts}\n`);
  process.exit(0);
});
