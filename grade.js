// Autograder for "2.1 HTML Basics" (flexible matching)
// Categories (75 pts auto):
//  - TODOs Completion: 25
//  - Correctness of Output: 25
//  - Code Quality: 25
// Submission Time (0–25) can be added via env SUBMISSION_POINTS (default 0).

import fs from 'fs-extra';
import cheerio from 'cheerio';

const HTML_FILE = process.env.HTML_FILE || 'index.html';
const SUBMISSION_POINTS = Number(process.env.SUBMISSION_POINTS || 0);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// Helpers
const norm = (s) => (s || '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const containsText = ($el, text) => norm($el.text()).includes(norm(text));
const hasExactText = ($el, text) => norm($el.text()) === norm(text); // not used for grading strictly
const intAttr = ($el, name) => {
  const v = ($el.attr(name) || '').trim();
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Build results
function resultRow(id, desc, pass, pts) {
  return { id, desc, pass: !!pass, ptsEarned: pass ? pts : 0, ptsMax: pts };
}

function grade(html) {
  const $ = cheerio.load(html, { decodeEntities: false });

  // ===== TODOs Completion (25 pts) =====
  const todoChecks = [];
  // Step 2: text elements present
  todoChecks.push(resultRow('h1_present', 'Has an <h1> element', $('h1').length >= 1, 5));
  todoChecks.push(resultRow('h2_present', 'Has an <h2> element', $('h2').length >= 1, 4));
  todoChecks.push(resultRow('p_desc_present', 'Has a paragraph with course description', $('p').length >= 1, 4));

  // Formatting paragraphs: strong, em, mark (allow across any <p>)
  const hasStrongInP = $('p strong').length >= 1;
  const hasEmInP = $('p em').length >= 1;
  const hasMarkInP = $('p mark').length >= 1;
  todoChecks.push(resultRow('p_strong', 'Has a <p> with <strong>', hasStrongInP, 3));
  todoChecks.push(resultRow('p_em', 'Has a <p> with <em>', hasEmInP, 3));
  todoChecks.push(resultRow('p_mark', 'Has a <p> with <mark>', hasMarkInP, 3));

  // Lists: topics + nested technologies
  const topicsH3 = $('h3').filter((_, el) => containsText($(el), 'course topics')).first();
  const webTechH3 = $('h3').filter((_, el) => containsText($(el), 'web technologies')).first();
  todoChecks.push(resultRow('h3_topics', 'Has <h3> "Course Topics:"', topicsH3.length > 0, 1.5));
  todoChecks.push(resultRow('h3_webtech', 'Has <h3> "Web Technologies:"', webTechH3.length > 0, 1.5));

  // Table present
  todoChecks.push(resultRow('table_present', 'Has a <table> with data', $('table').length >= 1, 0)); // count in correctness/quality
  // Image present
  todoChecks.push(resultRow('img_present', 'Has an <img> with alt text', $('img[alt]').length >= 1, 0)); // scored later

  const todoScore = todoChecks.reduce((s, r) => s + r.ptsEarned, 0);
  const todoMax = todoChecks.reduce((s, r) => s + r.ptsMax, 0);
  // Scale TODOs to 25
  const TODO_WEIGHT = 25;
  const todoScaled = Math.round((todoScore / todoMax) * TODO_WEIGHT * 100) / 100;

  // ===== Correctness of Output (25 pts) =====
  const corrChecks = [];
  // Headings text (flexible, case/space-insensitive)
  const h1Ok = $('h1').toArray().some(el => containsText($(el), 'swe 363'));
  const h2Ok = $('h2').toArray().some(el => containsText($(el), 'introduction to html'));
  corrChecks.push(resultRow('h1_text', 'H1 contains "SWE 363"', h1Ok, 4));
  corrChecks.push(resultRow('h2_text', 'H2 contains "Introduction to HTML"', h2Ok, 3));

  // Description paragraph contains key phrase loosely
  const pDescOk = $('p').toArray().some(el => {
    const t = norm($(el).text());
    return t.includes('course') && (t.includes('html') || t.includes('css') || t.includes('js'));
  });
  corrChecks.push(resultRow('p_desc_text', 'Description mentions course & HTML/CSS/JS', pDescOk, 3));

  // Topics list: following a Topics h3, ensure a UL with >=4 LI
  let topicsUlOk = false;
  if (topicsH3.length) {
    const nextUl = topicsH3.nextAll('ul').first();
    topicsUlOk = nextUl.length > 0 && nextUl.find('> li').length >= 4;
  }
  corrChecks.push(resultRow('topics_ul', 'Course Topics: UL has ≥ 4 items', topicsUlOk, 4));

  // Nested list: Web Technologies with Frontend/Backend each having a nested UL (≥3 items typical)
  let frontNestedOk = false, backNestedOk = false;
  if (webTechH3.length) {
    const nextUl = webTechH3.nextAll('ul').first();
    if (nextUl.length) {
      nextUl.find('> li').each((_, li) => {
        const $li = $(li);
        const text = norm($li.contents().filter((i, n) => n.type === 'text').text());
        const childUl = $li.children('ul').first();
        if (text.includes('frontend') && childUl.length && childUl.find('> li').length >= 3) frontNestedOk = true;
        if (text.includes('backend') && childUl.length && childUl.find('> li').length >= 3) backNestedOk = true;
      });
    }
  }
  corrChecks.push(resultRow('frontend_nested', 'Frontend has a nested list (≥3)', frontNestedOk, 3.5));
  corrChecks.push(resultRow('backend_nested', 'Backend has a nested list (≥3)', backNestedOk, 3.5));

  // Table headers & rows (flexible text)
  const table = $('table').first();
  let theadHeadersOk = false, tbodyRowsOk = false;
  if (table.length) {
    const thTexts = table.find('thead th').toArray().map(el => norm($(el).text()));
    const needed = ['student name', 'assignment 1', 'assignment 2', 'final grade'];
    theadHeadersOk = needed.every(n => thTexts.some(t => t.includes(n)));
    tbodyRowsOk = table.find('tbody tr').length >= 2;
  }
  corrChecks.push(resultRow('table_headers', 'Table headers present & correct', theadHeadersOk, 3.5));
  corrChecks.push(resultRow('table_rows', 'Table has ≥ 2 body rows', tbodyRowsOk, 3.5));

  // Image specifics
  const img = $('img').first();
  const imgSrcOk = img.length ? norm(img.attr('src')).includes('kfupm') : false;
  const widthOk = img.length ? Number.isFinite(intAttr(img, 'width')) : false;
  const heightOk = img.length ? Number.isFinite(intAttr(img, 'height')) : false;
  corrChecks.push(resultRow('img_src', 'Image src references KFUPM asset', imgSrcOk, 2));
  corrChecks.push(resultRow('img_wh', 'Image has numeric width & height', widthOk && heightOk, 2));

  const corrScore = corrChecks.reduce((s, r) => s + r.ptsEarned, 0);
  const corrMax = corrChecks.reduce((s, r) => s + r.ptsMax, 0);
  const CORR_WEIGHT = 25;
  const corrScaled = Math.round((corrScore / corrMax) * CORR_WEIGHT * 100) / 100;

  // ===== Code Quality (25 pts) =====
  const qualChecks = [];
  // Doctype
  const hasDoctype = /^<!doctype html>/i.test(html.trim());
  qualChecks.push(resultRow('doctype', 'Uses <!DOCTYPE html>', hasDoctype, 4));

  // <html lang="...">
  const htmlEl = $('html');
  const langAttr = (htmlEl.attr('lang') || '').trim();
  qualChecks.push(resultRow('lang', '<html> has lang attribute', langAttr.length > 0, 4));

  // <meta charset> & <title>
  const hasCharset = $('meta[charset], meta[http-equiv="Content-Type"][content*="charset"]').length > 0;
  const titleTxt = norm($('head title').first().text());
  qualChecks.push(resultRow('charset', 'Has <meta charset>', hasCharset, 4));
  qualChecks.push(resultRow('title', '<title> is non-empty', titleTxt.length > 0, 3));

  // Nested lists properly nested under <li>
  let nestedUnderLiOk = true;
  $('ul > ul, ol > ul, ul > ol, ol > ol').each(() => { nestedUnderLiOk = false; });
  qualChecks.push(resultRow('list_nesting', 'Nested lists are inside <li>', nestedUnderLiOk, 5));

  // Table uses thead/tbody
  const hasThead = table.length ? table.find('thead').length > 0 : false;
  const hasTbody = table.length ? table.find('tbody').length > 0 : false;
  qualChecks.push(resultRow('thead_tbody', 'Table uses <thead> and <tbody>', hasThead && hasTbody, 5));

  // Image alt non-empty (accessibility)
  const altOk = img.length ? (img.attr('alt') || '').trim().length > 0 : false;
  qualChecks.push(resultRow('img_alt', 'Image has meaningful alt text', altOk, 4));

  const qualScore = qualChecks.reduce((s, r) => s + r.ptsEarned, 0);
  const qualMax = qualChecks.reduce((s, r) => s + r.ptsMax, 0);
  const QUAL_WEIGHT = 25;
  const qualScaled = Math.round((qualScore / qualMax) * QUAL_WEIGHT * 100) / 100;

  // Totals
  const autoScore75 = clamp(todoScaled + corrScaled + qualScaled, 0, 75);
  const submissionPts = clamp(SUBMISSION_POINTS, 0, 25);
  const finalScore100 = autoScore75 + submissionPts;

  // Build markdown rows
  function rowsMd(arr) {
    return arr.map(r => `| ${r.pass ? '✅' : '❌'} | ${r.desc} | ${r.ptsEarned.toFixed(2)} / ${r.ptsMax} |`).join('\n');
    }

  const md = `# Automated Grade: 2.1 HTML Basics

**Automatic Score (out of 75):** **${autoScore75.toFixed(2)} / 75**

- TODOs Completion (25): **${todoScaled.toFixed(2)}**
- Correctness of Output (25): **${corrScaled.toFixed(2)}**
- Code Quality (25): **${qualScaled.toFixed(2)}**

**Submission Time Points (out of 25):** ${submissionPts}

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
- Matching is flexible: case-insensitive, ignores extra spaces, and validates structure (e.g., nested lists under <li>).
- If your main file isn’t \`${HTML_FILE}\`, your instructor can set \`HTML_FILE\` in the workflow.
`;

  const jsonReport = {
    auto_score_out_of_75: autoScore75,
    todo_scaled: todoScaled,
    correctness_scaled: corrScaled,
    quality_scaled: qualScaled,
    submission_points_out_of_25: submissionPts,
    final_score_out_of_100: finalScore100,
    details: {
      todos: todoChecks,
      correctness: corrChecks,
      quality: qualChecks
    }
  };

  const csv = `repo,auto_score_75,submission_25,final_100
${process.env.GITHUB_REPOSITORY || 'repo'},${autoScore75.toFixed(2)},${submissionPts},${finalScore100.toFixed(2)}
`;

  return { md, jsonReport, csv };
}

async function main() {
  const exists = await fs.pathExists(HTML_FILE);
  if (!exists) {
    const md = `# Automated Grade: 2.1 HTML Basics

**Status:** ❌ Could not find \`${HTML_FILE}\`.

**Automatic Score (out of 75):** 0.00 / 75  
**Submission Time Points (out of 25):** ${SUBMISSION_POINTS}  
**Final Score (out of 100):** ${SUBMISSION_POINTS.toFixed(2)} / 100

> Ensure your main HTML file is named \`index.html\` at the repo root (or set \`HTML_FILE\`).
`;
    await fs.writeFile('GRADE.md', md);
    await fs.writeJson('grade_report.json', { error: `Missing ${HTML_FILE}`, auto_score_out_of_75: 0, submission_points_out_of_25: SUBMISSION_POINTS, final_score_out_of_100: SUBMISSION_POINTS }, { spaces: 2 });
    await fs.writeFile('grade_report.csv', `repo,auto_score_75,submission_25,final_100\n${process.env.GITHUB_REPOSITORY || 'repo'},0,${SUBMISSION_POINTS},${SUBMISSION_POINTS}\n`);
    return;
  }

  const html = await fs.readFile(HTML_FILE, 'utf8');
  const { md, jsonReport, csv } = grade(html);

  await fs.writeFile('GRADE.md', md);
  await fs.writeJson('grade_report.json', jsonReport, { spaces: 2 });
  await fs.writeFile('grade_report.csv', csv);
}

main().catch(async (e) => {
  await fs.writeFile('GRADE.md', `# Automated Grade: 2.1 HTML Basics

**Status:** ❌ Autograder crashed.

\`\`\`
${e.stack || e.message}
\`\`\`

**Automatic Score (out of 75):** 0.00 / 75  
**Submission Time Points (out of 25):** ${SUBMISSION_POINTS}  
**Final Score (out of 100):** ${SUBMISSION_POINTS.toFixed(2)} / 100
`);
  await fs.writeJson('grade_report.json', { error: e.message, auto_score_out_of_75: 0, submission_points_out_of_25: SUBMISSION_POINTS, final_score_out_of_100: SUBMISSION_POINTS }, { spaces: 2 });
  await fs.writeFile('grade_report.csv', `repo,auto_score_75,submission_25,final_100\n${process.env.GITHUB_REPOSITORY || 'repo'},0,${SUBMISSION_POINTS},${SUBMISSION_POINTS}\n`);
  process.exit(0); // do not fail the workflow; report gracefully
});
