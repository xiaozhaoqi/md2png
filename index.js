#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const puppeteer = require('puppeteer');
const path = require('path');
const showdown = require('showdown');
const fs = require('fs');

clear();
console.log(
  chalk.yellow(
    figlet.textSync('md2png', { horizontalLayout: 'full' })
  )
);

const run = async () => {
  const file = process.argv[2]
  if (!file) {
    console.error('error! use "md2png filename.md"');
    return
  }
  try {
    const f = path.parse(path.join(process.cwd(), file));
    const tmpfilename = path.join(f.dir, f.name + '_tmp.html');
    const converter = new showdown.Converter();
    const text = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    const html = converter.makeHtml(text);
    fs.writeFileSync(tmpfilename, html, 'utf-8');
    const browser = await puppeteer.launch({
      executablePath: puppeteer.executablePath(),
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(tmpfilename, { waitUntil: 'networkidle0' });
    await page.screenshot({
      path: path.join(f.dir, f.name + '.png'),
      fullPage: true,
      omitBackground: false,
    });
    await browser.close();
    fs.unlink(tmpfilename, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(chalk.green('Convert success!\nPNG file saved at the same path.'));
      }
    });
  } catch (error) {
    console.log(chalk.red('Convert failed!\nPlease run this command at the markdown file path.\nMore info:\n' + error));
  }
}

run();
