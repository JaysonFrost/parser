const puppeteer = require('puppeteer');
const _ = require('lodash');

const _this = this;
function parseMatch(page) {
  const elemForParse = page.document.querySelectorAll('.exodus.ng-star-inserted');
  // Виды ставок
  const output = [];
  const htmlArray = Array.from(elemForParse);
  const data = _.map(htmlArray, (exod) => {
    // Таблицы
    const headerName = exod.childNodes[0].innerText;
    const results = exod.querySelectorAll('.result-table');
    const resultTable = Array.from(results).map(elem => {
      // Элементы
      const name = elem.querySelector('.result-table__header').innerText;
      const tables = elem.querySelectorAll('.result-table__row');

      const dataFromRows = Array.from(tables).map(row => {
        const betData = Array.from(row.children).slice(1).map(el => {
          const betInfo = el.querySelector('.result-table__info');
          const betCount = el.querySelector('.result-table__count');

          return {betInfo: betInfo && betInfo.innerHTML, betCount: betCount && betCount.innerHTML};
        });
        return betData;
      });
      return {name, tables: dataFromRows};
    });

    output.push({headerName, results: resultTable});
    return {headerName, results: resultTable};
  });
  console.log('data', output);
  return output;
}

async function parseMatches() {
  try {
    const that = _this;
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://winline.ru/now/');
    await page.setViewport({width: 2000, height: 5000, deviceScaleFactor: 0.2});
    await page.waitFor(1000);
    await page.evaluate(() => {
      window.parseMatch = this.parseMatch;
    });
    const result = await page.evaluate(async (parseMatch) => {
      const parseMatchFunc = new Function(` return (${ parseMatch }).apply(null, arguments)`);
      const matches = document.querySelectorAll('.statistic__match');
      const matchHrefs = Array.from(matches).map(elem => elem.href);
      const parsedMatches = [];
      const pages = [];

      const page = window.open(matchHrefs[0], '_blank');
      async function getData() {
        setTimeout(() => {
          const match = parseMatchFunc.call(null, page);
          parsedMatches.push(match);
        }, 4000);
        return parsedMatches;
      }
      const data = await getData();
      console.log(12412414241, data);
      return JSON.stringify(data);
    }, parseMatch.toString());
    console.log(11111111, result);
    return result;
  } catch (e) {
    console.log(e);
  }
}

parseMatches().then((value) => {
  console.log(123123, JSON.stringify(value));
});
