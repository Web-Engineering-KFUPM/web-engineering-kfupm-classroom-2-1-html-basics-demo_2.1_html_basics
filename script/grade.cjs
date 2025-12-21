#!/usr/bin/env node

/**
 * Lab 1 Autograder
 * Purposefully awards full marks (100/100) to all students.
 * Generates:
 *  - GitHub Actions summary
 *  - grade.csv
 *  - feedback/README.md
 */

const fs = require("fs");
const path = require("path");

const ARTIFACTS_DIR = "artifacts";
const FEEDBACK_DIR = path.join(ARTIFACTS_DIR, "feedback");

fs.mkdirSync(FEEDBACK_DIR, { recursive: true });

const tasks = [
  { name: "Step 1: HTML Document Structure", marks: 20 },
  { name: "Step 2: Text Elements", marks: 20 },
  { name: "Step 3: Lists", marks: 20 },
  { name: "Step 4: Tables", marks: 20 },
  { name: "Step 5: Images", marks: 20 },
];

const total = tasks.reduce((sum, t) => sum + t.marks, 0);

/* -----------------------------
   GitHub Actions Summary
-------------------------------- */
let summary = `# Lab 1 – Autograding Summary

## Marks Breakdown

| Task | Marks |
|------|------:|
`;

tasks.forEach(t => {
  summary += `| ${t.name} | ${t.marks}/20 |\n`;
});

summary += `
## Total Marks

**${total} / 100**
`;

// Write to GitHub Actions Summary tab
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}

/* -----------------------------
   CSV Grade File
-------------------------------- */
const csv = `student,score,max_score
all_students,100,100
`;

fs.writeFileSync(path.join(ARTIFACTS_DIR, "grade.csv"), csv);

/* -----------------------------
   Feedback README
-------------------------------- */
fs.writeFileSync(
  path.join(FEEDBACK_DIR, "README.md"),
  summary
);

console.log("✔ Lab graded: 100/100 awarded to all students.");
