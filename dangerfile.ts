/**
 * Danger.js PR Review Automation
 *
 * Runs on every PR to provide automated feedback.
 * Install: npm install -g danger
 * Run: danger ci (in GitHub Actions)
 */
import { danger, warn, fail, message } from 'danger';

const modifiedFiles = danger.git.modified_files;
const createdFiles = danger.git.created_files;
const allChangedFiles = [...modifiedFiles, ...createdFiles];

// =============================================================================
// Rule 1: Source changes should have corresponding tests
// =============================================================================
const srcFiles = allChangedFiles.filter(
  (f) => (f.includes('/src/') || f.includes('/app')) && !f.includes('.test.') && !f.includes('.spec.')
);
const testFiles = allChangedFiles.filter((f) => f.includes('.test.') || f.includes('.spec.') || f.includes('/tests/'));

if (srcFiles.length > 0 && testFiles.length === 0) {
  warn(
    '⚠️ This PR modifies source files but adds no tests.\n' +
      'Consider adding tests for: ' +
      srcFiles.slice(0, 3).join(', ') +
      (srcFiles.length > 3 ? ` and ${srcFiles.length - 3} more` : '')
  );
}

// =============================================================================
// Rule 2: Check for `any` type in TypeScript files
// =============================================================================
const tsFiles = allChangedFiles.filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));

const checkForAnyType = async () => {
  for (const file of tsFiles) {
    const diff = await danger.git.diffForFile(file);
    if (diff && diff.added) {
      // Check only added lines for `any` type
      const addedLines = diff.added.split('\n');
      const anyTypeLines = addedLines.filter(
        (line) => line.includes(': any') || line.includes('<any>') || line.includes('as any')
      );

      if (anyTypeLines.length > 0) {
        fail(
          `❌ Found \`any\` type in ${file}. Use \`unknown\` with type guards instead.\n` +
            '```\n' +
            anyTypeLines.slice(0, 3).join('\n') +
            '\n```'
        );
      }
    }
  }
};

// =============================================================================
// Rule 3: Large PRs should be broken down
// =============================================================================
const bigPRThreshold = 500;
const totalChanges = danger.github.pr.additions + danger.github.pr.deletions;

if (totalChanges > bigPRThreshold) {
  warn(
    `⚠️ This PR has ${totalChanges} changes (${danger.github.pr.additions}+ / ${danger.github.pr.deletions}-).\n` +
      'Large PRs are harder to review. Consider breaking into smaller PRs.'
  );
}

// =============================================================================
// Rule 4: TODO comments should have issue links
// =============================================================================
const checkForTodos = async () => {
  for (const file of allChangedFiles) {
    const diff = await danger.git.diffForFile(file);
    if (diff && diff.added) {
      const todoLines = diff.added.split('\n').filter((line) => /TODO|FIXME|HACK|XXX/.test(line));

      const unlinkedTodos = todoLines.filter((line) => !/#\d+/.test(line) && !/https?:\/\//.test(line));

      if (unlinkedTodos.length > 0) {
        warn(
          `⚠️ Found TODO comments without issue links in ${file}.\n` +
            'Consider linking to an issue: `// TODO(#123): description`'
        );
      }
    }
  }
};

// =============================================================================
// Rule 5: Package.json changes should update lockfile
// =============================================================================
const packageJsonChanged = allChangedFiles.includes('package.json');
const lockfileChanged =
  allChangedFiles.includes('package-lock.json') || allChangedFiles.includes('yarn.lock') || allChangedFiles.includes('pnpm-lock.yaml');

if (packageJsonChanged && !lockfileChanged) {
  fail('❌ `package.json` was modified but lockfile was not updated. Run `npm install` to update.');
}

// =============================================================================
// Rule 6: Celebrate good PRs!
// =============================================================================
if (testFiles.length > srcFiles.length) {
  message('🎉 Great job! This PR adds more test files than source files.');
}

// Run async checks
Promise.all([checkForAnyType(), checkForTodos()]);
