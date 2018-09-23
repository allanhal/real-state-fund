const tabletojson = require('tabletojson')
const stripHtml = require("string-strip-html")

var express = require('express');
var router = express.Router();

const URL = 'https://fiis.com.br/indicadores-estendido/'

router.get('/my', function (req, res, next) {
  let prefferedFiis = require('./../prefferedFiis')
  res.json(prefferedFiis)
});

router.get('/all', function (req, res, next) {
  tabletojson.convertUrl(URL, {
    stripHtmlFromCells: false
  }, (tablesAsJson) => {
    let fiis = tablesAsJson[0]
    fiis = parseFiisJson(fiis)
    res.json(fiis)
  });
});

router.get('/myComplete', function (req, res, next) {
  let prefferedFiis = require('../../prefferedFiis')
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

router.get('/:cod', function (req, res, next) {
  let cod = req.params.cod
  tabletojson.convertUrl(URL, {
    stripHtmlFromCells: false
  }, (tablesAsJson) => {
    let fiis = tablesAsJson[0]
    fiis = parseFiisJson(fiis)
    res.json(fiis.find(fii => fii.cod.toLowerCase() == cod.toLowerCase()))
  });
});

function getAllFiis() {
  return new Promise((resolve, reject) => {
    tabletojson.convertUrl(URL, {
      stripHtmlFromCells: false
    }, (tablesAsJson) => {
      let fiis = tablesAsJson[0]
      fiis = parseFiisJson(fiis)
      resolve(fiis)
    });
  })
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
  return parseFloat(Math.round(Number(toParse.split('%').join('').split('R$').join('').split('.').join('').split(',').join('.')) * multiplier * 100) / 100)
}

module.exports = router;