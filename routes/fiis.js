const tabletojson = require('tabletojson')
const stripHtml = require("string-strip-html")

var path = require('path');
var express = require('express');
var router = express.Router();

const URL = 'https://fiis.com.br/indicadores-estendido/'
const URL_FUNDS_EXPLORER = 'http://www.fundsexplorer.com.br/funds'
const prefferedFiis = require(path.join(__dirname, '../prefferedFiis'))

const CACHE_IN_MINUTES = 20

let cachedTablesAsJson;
let tablesAsJson_expires_on = 0
let cachedTablesAsJsonFromFundsExplorer;
let tablesAsJsonFromFundsExplorer_expires_on = 0

router.get('/my', function (req, res, next) {
  res.json(prefferedFiis)
});

router.get('/myComplete', function (req, res, next) {
  getAllFiis().then(fiis => {
    let fiisToReturn = []
    prefferedFiis.forEach(prefferedFii => {
      let searchedFii = fiis.find(fii => fii.cod == prefferedFii.cod)
      searchedFii.qt = prefferedFii.qt
      searchedFii.totalValueInvested = prefferedFii.qt * searchedFii.price
      fiisToReturn.push(searchedFii)
    });

    res.json(fiisToReturn)
  })
});

router.get('/', function (req, res, next) {
  getAllFiis().then(fiis => {
    res.json(fiis)
  })
});

router.get('/:cod', function (req, res, next) {
  let cod = req.params.cod
  getAllFiis().then(fiis => {
    let fii = fiis.find(fii => fii.cod.toLowerCase() == cod.toLowerCase())
    if (fii) {
      res.json(fii)
    } else {
      res.status(400).send('Fii not found.')
    }
    res.json(fiis)
  })
});

function getAllFiis() {
  return new Promise((resolve, reject) => {
    getFiisFromApi().then(fiis => {
      getFundsExplorer().then(fiisFromFundsExplorer => {
        fiis.forEach(fii => {
          fiiFromFundsExplorer = fiisFromFundsExplorer.find(fiiFromFundsExplorer => fiiFromFundsExplorer.cod == fii.cod)
          if (fiiFromFundsExplorer) {
            fii.price = fiiFromFundsExplorer.price
            fii.vp = to2Decimal(fii.price / fii.valuePrice)
            fii.lastDyPercentage = to2Decimal(fii.lastDy / fii.price * 100)
            fii.lastDyPercentageAnnualy = to2Decimal(fii.lastDy / fii.price * 100 * 12)
            fii.annualAverageDyPercentage = to2Decimal(fii.annualAverageDy / fii.price * 100 * 12)
          }
        });
        resolve(fiis)
      })
    });
  })
}

function getFiisFromApi() {
  return new Promise((resolve, reject) => {
    if (new Date() > tablesAsJson_expires_on) {
      tablesAsJson_expires_on = new Date(new Date().getTime() + (CACHE_IN_MINUTES * 60 * 1000))
      tabletojson.convertUrl(URL, {
        stripHtmlFromCells: false
      }, (tablesAsJson) => {
        let fiis = tablesAsJson[0]
        cachedTablesAsJson = parseFiisJson(fiis)
        resolve(cachedTablesAsJson)
      });
    } else {
      resolve(cachedTablesAsJson)
    }
  })
}

function getFundsExplorer() {
  return new Promise((resolve, reject) => {
    if (new Date() > tablesAsJsonFromFundsExplorer_expires_on) {
      tablesAsJsonFromFundsExplorer_expires_on = new Date(new Date().getTime() + (CACHE_IN_MINUTES * 60 * 1000))
      tabletojson.convertUrl(URL_FUNDS_EXPLORER, tablesAsJsonFromFundsExplorer => {
        let fiisFromFundsExplorer = tablesAsJsonFromFundsExplorer[0]
        cachedTablesAsJsonFromFundsExplorer = parseFiisJsonFromFundsExplorer(fiisFromFundsExplorer)
        resolve(cachedTablesAsJsonFromFundsExplorer)
      });
    } else {
      resolve(cachedTablesAsJsonFromFundsExplorer)
    }
  })
}

function parseFiisJsonFromFundsExplorer(fiis) {
  fiis = fiis.map(fii => parseFiiJsonFromFundsExplorer(fii));
  return fiis
}

function parseFiiJsonFromFundsExplorer(fii) {
  let toReturn = {}
  toReturn.cod = fii['Ativo'].split('*')[0].trim()
  toReturn.price = parseNumber(fii['Preço de Mercado'])
  return toReturn
}

function parseFiisJson(fiis) {
  fiis.map(fii => parseFiiJson(fii));
  return fiis
}

function parseFiiJson(fii) {
  fii['Código'] = stripHtml(fii['Código'])
  fii.cod = fii['Código'].split('*')[0].trim()
  delete fii['Código']

  fii.price = parseNumber(fii['Cotação Usada'])
  delete fii['Cotação Usada']

  fii.valuePrice = parseNumber(fii['Patrimônio por Cota*'])
  delete fii['Patrimônio por Cota*']

  fii.vp = parseNumber(fii['Cotação / Patrimônio*'])
  delete fii['Cotação / Patrimônio*']

  fii.lastDy = parseNumber(fii['ÚltimoRendimento'].split('<br>')[0])
  fii.lastDyPercentage = parseNumber(fii['ÚltimoRendimento'].split('<br>')[1])
  fii.lastDyPercentageAnnualy = parseNumber(fii['ÚltimoRendimento'].split('<br>')[1], 12)
  delete fii['ÚltimoRendimento']

  fii.annualAverageDy = parseNumber(fii['Rendimento Médio (12 mêses)**'].split('<br>')[0])
  fii.annualAverageDyPercentage = parseNumber(fii['Rendimento Médio (12 mêses)**'].split('<br>')[1])
  delete fii['Rendimento Médio (12 mêses)**']

  delete fii['N° negócios / mês']
  delete fii['N° Cotas negociadas / mês']

  fii.obs = fii['OBS']
  delete fii['OBS']

  return fii
}

function parseNumber(toParse, multiplier = 1) {
  return to2Decimal(Number(toParse.split('%').join('').split('R$').join('').split('.').join('').split(',').join('.')), multiplier)
}

function to2Decimal(toParse, multiplier = 1) {
  return parseFloat(Math.round(toParse * multiplier * 100) / 100)
}

module.exports = router;