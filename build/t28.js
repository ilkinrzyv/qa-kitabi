// Git practice (git.json): every task is solved in the terminal (and the editor) and all its checks turn green; Git's own
// messages appear where Git prints them (not a repository, identity, src refspec, rejected push, divergent pull,
// conflict, ignored path, typo); dangerous commands are refused with a reason; restart, links and the phone layout work.
const fs = require('fs');
const path = require('path');
const { setup } = require('./harness');
const GJ = JSON.parse(fs.readFileSync(path.join(__dirname, 'git.json'), 'utf8'));
const go = (page, h) => page.evaluate(h => { location.hash = h; }, h).then(() => page.waitForTimeout(300));
(async () => {
  const out = { tasks: {} }; const ERRORS = []; const bad = [];
  let { browser, page, errors } = await setup({ hash: '#git-g1', w: 1024, h: 1300, wait: 1200 });
  const run = async c => { await page.fill('#git-in', c); await page.press('#git-in', 'Enter'); await page.waitForTimeout(40); };
  const runAll = async cs => { for (const c of cs) await run(c); };
  const edit = async (f, fn) => {
    await page.click(`[data-act="git-open"][data-f="${f}"]`); await page.waitForTimeout(60);
    const v = await page.$eval('#git-ta', e => e.value); await page.fill('#git-ta', fn(v)); await page.click('[data-act="git-save"]'); await page.waitForTimeout(60);
  };
  const term = () => page.$eval('#git-out', e => e.innerText);
  const last = async () => { const t = await term(), i = t.lastIndexOf('PS C:'); return t.slice(i); };
  const checks = () => page.$$eval('.git-checks li', x => x.map(li => li.querySelector('.sm-ok') ? '✓' : '✗').join(''));
  const done = () => page.$$eval('#git-case .sm-good', x => x.length);
  const SOL = {
    g1: async () => {
      await run('git status'); out.notRepo = (await last()).includes('fatal: not a git repository');
      await run('git init'); out.initHint = (await last()).includes("hint: Using 'master' as the name for the initial branch");
      await run('git status'); const st = await last();
      out.firstStatus = st.includes('No commits yet') && st.includes('\ttests/') && !st.includes('node_modules') && !st.includes('test-results');
      await run('git add .');
      await run('git commit -m "Initial Playwright tests"'); out.identity = (await last()).includes('*** Please tell me who you are.');
      await runAll(['git config --global user.name "QA Tələbə"', 'git config --global user.email "qa@example.com"', 'git commit -m "Initial Playwright tests"']);
      out.rootCommit = /\[master \(root-commit\) [0-9a-f]{7}\] Initial Playwright tests/.test(await last());
      await run('git push -u origin main'); out.noRemote = (await last()).includes("fatal: 'origin' does not appear to be a git repository");
      await run(`git remote add origin ${GJ.url}`);
      await run('git push -u origin main'); out.refspec = (await last()).includes('error: src refspec main does not match any');
      await run('git branch -M main'); out.prompt = await page.$eval('#git-ps', e => e.textContent);
      await run('git push -u origin main'); const p = await last();
      out.pushed = p.includes(' * [new branch]      main -> main') && p.includes("branch 'main' set up to track 'origin/main'.");
    },
    g2: async () => {
      await run('git diff');
      out.diff = await page.$$eval('#git-out .git-l.dp', x => x.map(e => e.textContent).join('|'));
      await edit('tests/login.spec.js', v => v.split('\n').filter(l => !l.includes('console.log')).join('\n'));
      await runAll(['git add tests/login.spec.js', 'git commit -m "Fix locked user error assertion"']);
      out.summary = (await last()).includes('1 file changed, 1 insertion(+), 1 deletion(-)');
    },
    g3: async () => {
      await runAll(['git restore --staged debug.log .env', 'echo ".env" >> .gitignore', 'echo "*.log" >> .gitignore', 'git add .env']);
      out.ignoredAdd = (await last()).includes('The following paths are ignored by one of your .gitignore files:');
      await runAll(['git add tests/cart.spec.js .gitignore', 'git commit -m "Add cart test and ignore secrets"']);
    },
    g4: async () => {
      await runAll(['git switch -c feature/cart-test', 'git add tests/cart.spec.js', 'git commit -m "Add cart badge test"', 'git switch main', 'ls tests']);
      out.lsAfterSwitch = (await last()).split('\n').slice(1).join(',').trim();
      await run('git merge feature/cart-test'); out.ff = (await last()).includes('Fast-forward');
    },
    g5: async () => {
      await run('git branch -d feature/two-products'); out.notMerged = (await last()).includes("error: the branch 'feature/two-products' is not fully merged.");
      await run('git merge feature/two-products'); out.conflict = (await last()).includes('CONFLICT (content): Merge conflict in tests/cart.spec.js');
      await run('git commit -m "x"'); out.unmerged = (await last()).includes('error: Committing is not possible because you have unmerged files.');
      out.markers = await page.$eval('[data-act="git-open"][data-f="tests/cart.spec.js"] code', e => e.textContent);
      await edit('tests/cart.spec.js', v => v.replace(/<<<<<<< HEAD\n[\s\S]*?=======\n[\s\S]*?>>>>>>> [^\n]*\n/, "  await expect(cartBadge).toHaveText('2', { timeout: 10000 });\n"));
      await runAll(['git add tests/cart.spec.js', 'git commit']);
      out.mergeMsg = (await last()).includes("Merge branch 'feature/two-products'");
      out.mergeDot = await page.$$eval('.git-graph circle[r="6"]', x => x.length);
    },
    g6: async () => {
      await run('git push'); out.rejected = (await last()).includes('! [rejected]        main -> main (fetch first)');
      await run('git pull'); out.divergent = (await last()).includes('fatal: Need to specify how to reconcile divergent branches.');
      await run('git pull --rebase'); out.rebased = (await last()).includes('Successfully rebased and updated refs/heads/main.');
      await run('git push'); out.github = await page.$eval('.git-rem .git-sync', e => e.textContent);
    },
    g7: async () => {
      await run('git reset --hard HEAD~1'); out.reset = (await last()).includes('bu məşqdə bağlıdır');
      await run('git push --force'); out.force = (await last()).includes('bu məşqdə bağlıdır');
      await runAll(['git revert c0ffe12', 'git push']);
      await run('git comit -m x'); out.typo = (await last()).includes('The most similar command is\n\tcommit') || (await last()).includes('The most similar command is');
      await run('touchh a.txt'); out.shell = (await last()).includes("is not recognized as the name of a cmdlet");
    }
  };
  for (const t of GJ.tasks) {
    await go(page, '#git-' + t.id);
    const before = await checks();
    await SOL[t.id]();
    out.tasks[t.id] = `${before} → ${await checks()}`;
    if (before === '✓'.repeat(t.checks.length) || (await checks()) !== '✓'.repeat(t.checks.length) || !(await done())) bad.push('task ' + t.id + ': ' + out.tasks[t.id]);
  }
  const want = { notRepo: true, initHint: true, firstStatus: true, identity: true, rootCommit: true, noRemote: true, refspec: true, pushed: true, summary: true, ignoredAdd: true, ff: true,
    notMerged: true, conflict: true, unmerged: true, mergeMsg: true, rejected: true, divergent: true, rebased: true, reset: true, force: true, typo: true, shell: true };
  Object.entries(want).forEach(([k, v]) => { if (out[k] !== v) bad.push('message ' + k); });
  if (out.prompt !== 'PS C:\\qa\\playwright-practice [main]>') bad.push('prompt ' + out.prompt);
  if (!/^\+  await expect\(page\.locator\('\[data-test="error"\]'\)\)\.toContainText\('locked out'\);$/m.test(out.diff.split('|').join('\n')) || !out.diff.includes('console.log')) bad.push('diff');
  if (out.lsAfterSwitch !== 'login.spec.js') bad.push('switch takes the branch file away: ' + out.lsAfterSwitch);
  if (out.markers !== 'UU' || out.mergeDot !== 1 || out.github !== 'lokal ilə eynidir') bad.push('conflict / graph / github');
  // the history, the restart, the chips
  await page.focus('#git-in'); await page.keyboard.press('ArrowUp'); out.history = await page.$eval('#git-in', e => e.value);
  await page.click('[data-act="git-reset"]'); await page.waitForTimeout(100); await page.click('[data-act="confirm-ok"]'); await page.waitForTimeout(200);
  out.afterReset = { checks: await checks(), log: (await term()).trim().length, chips: await page.$$eval('.sm-pick .chip.pass', x => x.length) };
  if (out.history !== 'touchh a.txt' || out.afterReset.checks.includes('✓') || out.afterReset.log || out.afterReset.chips !== GJ.tasks.length - 1) bad.push('history / restart');
  await page.screenshot({ path: 'shots/git-1024.png', fullPage: true });
  // entry points: chapter 20's sections, the practice tab
  await go(page, '#c20s2');
  out.links = await page.$$eval('#c20s2 .sm-link [data-act="git-open-task"]', x => x.length);
  await page.click('#c20s2 .sm-link [data-act="git-open-task"][data-id="g3"]'); await page.waitForTimeout(300);
  out.opened = await page.$eval('#git-case .sm-id', e => e.textContent);
  await go(page, '#mesq');
  out.practice = await page.$eval('#view [data-act="git-open-task"]', e => e.closest('section').querySelector('.block-h > span').textContent);
  if (out.links !== GJ.tasks.length || !out.opened.startsWith('G-3') || out.practice !== `${GJ.tasks.length}/${GJ.tasks.length} tapşırıq`) bad.push('entry points');
  ERRORS.push(...errors); await browser.close();
  // phone, dark: the terminal and the panes fit
  ({ browser, page, errors } = await setup({ hash: '#git-g5', w: 360, h: 760, mobile: true, dark: true, wait: 1200 }));
  await run('git merge feature/two-products'); await run('git status');
  await page.click('[data-act="git-open"][data-f="tests/cart.spec.js"]'); await page.waitForTimeout(80);
  await page.screenshot({ path: 'shots/git-360-dark.png', fullPage: true });
  out.overflow360 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (out.overflow360 > 0) bad.push('overflow 360');
  ERRORS.push(...errors); await browser.close();
  console.log(JSON.stringify(out, null, 1));
  ERRORS.push(...bad);
  console.log('ERRORS', ERRORS);
  if (ERRORS.length) process.exitCode = 1;
})();
