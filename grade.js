// Autograder for "2.1 HTML Basics" (intro lab - full credit version)
// Every student gets 100/100. Files are still checked for existence,
// but only to show a helpful status message in GRADE.md – not to deduct points.

import { access, writeFile } from 'fs/promises';
import { constants as FS } from 'fs';

const HTML_FILE = process.env.HTML_FILE || 'index.html';

// --- minimal helpers to replace fs-extra ---
async function pathExists(p) {
  try {
    await access(p, FS.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function writeJson(path, obj, opts = {}) {
  const spaces = typeof opts.spaces === 'number' ? opts.spaces : 0;
  await writeFile(path, JSON.stringify(obj, null, spaces));
}

async function main() {
  const exists = await pathExists(HTML_FILE);

  const autoScore75 = 75;
  const submissionPts = 25;
  const finalScore100 = 100;

  const statusLine = exists
    ? `**Status:** ✅ Full credit awarded for this introductory lab.\n\n`
    : `**Status:** ⚠️ Could not find \`${HTML_FILE}\`, but full credit is still awarded for this introductory lab.\n\n`;

  const md = `# Automated Grade: 2.1 HTML Basics (Intro Lab – Full Credit)

${statusLine}**Automatic Score (out of 75):** ${autoScore75.toFixed(2)} / 75  
**Submission Time (out of 25):** ${submissionPts.toFixed(2)} / 25  
**Final Score (out of 100):** **${finalScore100.toFixed(2)} / 100**

> This lab is configured so that all students receive full marks.
`;

  const jsonReport = {
    auto_score_out_of_75: autoScore75,
    todo_scaled: autoScore75, // kept for compatibility, even though everything is full
    correctness_scaled: autoScore75,
    quality_scaled: autoScore75,
    submission_points_out_of_25: submissionPts,
    final_score_out_of_100: finalScore100,
    is_late_submission: false,
    details: {
      todos: [],
      correctness: [],
      quality: []
    },
    note: 'Introductory lab: all students receive full credit.'
  };

  const csv = `repo,auto_score_75,submission_25,final_100
${process.env.GITHUB_REPOSITORY || 'repo'},${autoScore75.toFixed(2)},${submissionPts.toFixed(
    2
  )},${finalScore100.toFixed(2)}
`;

  await writeFile('GRADE.md', md);
  await writeJson('grade_report.json', jsonReport, { spaces: 2 });
  await writeFile('grade_report.csv', csv);
}

main().catch(async (e) => {
  // Even if something crashes, still give full credit
  const autoScore75 = 75;
  const submissionPts = 25;
  const finalScore100 = 100;

  const md = `# Automated Grade: 2.1 HTML Basics (Intro Lab – Full Credit)

**Status:** ⚠️ Autograder crashed, but full credit is still awarded.

\`\`\`
${e.stack || e.message}
\`\`\`

**Automatic Score (out of 75):** ${autoScore75.toFixed(2)} / 75  
**Submission Time (out of 25):** ${submissionPts.toFixed(2)} / 25  
**Final Score (out of 100):** **${finalScore100.toFixed(2)} / 100**
`;

  const jsonReport = {
    error: e.message,
    auto_score_out_of_75: autoScore75,
    submission_points_out_of_25: submissionPts,
    final_score_out_of_100: finalScore100,
    note: 'Introductory lab: all students receive full credit, even if the autograder crashes.'
  };

  const csv = `repo,auto_score_75,submission_25,final_100
${process.env.GITHUB_REPOSITORY || 'repo'},${autoScore75.toFixed(2)},${submissionPts.toFixed(
    2
  )},${finalScore100.toFixed(2)}
`;

  await writeFile('GRADE.md', md);
  await writeJson('grade_report.json', jsonReport, { spaces: 2 });
  await writeFile('grade_report.csv', csv);
  process.exit(0);
});
