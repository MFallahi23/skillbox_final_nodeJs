const fs = require("fs");
const path = require("path");

const chromePath = path.join(
  __dirname,
  ".cache/puppeteer",
  "chrome",
  "linux-138.0.7204.94",
  "chrome-linux64",
  "chrome",
);

console.log("Does Chromium exist?", fs.existsSync(chromePath), chromePath);
