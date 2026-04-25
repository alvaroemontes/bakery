const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? '-' + process.argv[3] : '';
const outDir = path.join(__dirname, 'temporary screenshots');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const existing = fs.readdirSync(outDir).filter(function(f) {
  return f.startsWith('screenshot-') && f.endsWith('.png');
});
const nums = existing.map(function(f) {
  const m = f.match(/screenshot-(\d+)/);
  return m ? parseInt(m[1]) : 0;
}).filter(Boolean);
const n = nums.length ? Math.max.apply(null, nums) + 1 : 1;
const outFile = path.join(outDir, 'screenshot-' + n + label + '.png');

puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(function(browser) {
  return browser.newPage().then(function(page) {
    return page.setViewport({ width: 1440, height: 900 })
      .then(function() { return page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 }); })
      .then(function() { return page.screenshot({ path: outFile, fullPage: true }); })
      .then(function() { return browser.close(); })
      .then(function() { console.log('Saved: ' + outFile); });
  });
}).catch(function(err) {
  console.error(err);
  process.exit(1);
});
