const tabletojson = require('tabletojson')
const stripHtml = require("string-strip-html")
const path = require('path');
const express = require('express');
const router = express.Router();

const URL = 'https://fiis.com.br/indicadores-estendido/'
const URL_SEGMENTO = 'https://fiis.com.br/lista-por-segmento-anbima/'
const URL_TYPE = 'https://fiis.com.br/lista-por-tipo/'

const URL_FUNDS_EXPLORER = 'http://www.fundsexplorer.com.br/funds'
const prefferedFiis = require(path.join(__dirname, '../prefferedFiis'))

const CACHE_IN_MINUTES = 20

let cachedTablesAsJson;
let tablesAsJsonExpiresOn = 0

let cachedTablesAsJsonFromFundsExplorer;
let tablesAsJsonFromFundsExplorer_expires_on = 0

let cachedTablesAsJsonBySegment;
let tablesAsJsonExpiresOnBySegment = 0

let cachedTablesAsJsonByType;
let tablesAsJsonExpiresOnByType = 0

router.get('/my', (req, res) => {
  res.json(prefferedFiis)
});

router.get('/list', (req, res) => {
  _getAllFiis().then(fiis => {
    res.json(fiis.map(fii => fii.cod))
  })
});

router.get('/myComplete', (req, res) => {
  _getAllFiis().then(fiis => {
    let fiisToReturn = []
    prefferedFiis.forEach(prefferedFii => {
      let searchedFii = fiis.find(fii => fii.cod == prefferedFii.cod)
      let qt = prefferedFii.qt
      if (qt) {
        searchedFii.qt = qt
        searchedFii.totalValueInvested = qt * searchedFii.price
      }
      fiisToReturn.push(searchedFii)
    });

    res.json(fiisToReturn)
  })
});

router.get('/', (req, res) => {
  _getFiisFromApiBySegment().then(resultSegment => {
    _getFiisFromApiByType().then(resultType => {
      _getAllFiis().then(fiis => {
        fiis.forEach(fii => {
          fii.segment = _getInfoFrom(resultSegment, fii);
          fii.type = _getInfoFrom(resultType, fii);
        })
        res.json(fiis)
      })
    })
  })
});

router.get('/segment/', (req, res) => {
  _getAllFiis().then(fiis => {
    _getFiisFromApiBySegment().then(result => {
      let toReturn = _populateWithFii(result, fiis);
      res.json(toReturn)
    })
  })
});

router.get('/segment/:segment', (req, res) => {
  let segment = req.params.segment.toUpperCase()
  _getAllFiis().then(fiis => {
    _getFiisFromApiBySegment().then(result => {
      let toReturn = _populateWithFii(result, fiis);
      res.json(toReturn[segment])
    })
  })
});

router.get('/type/', (req, res) => {
  _getAllFiis().then(fiis => {
    _getFiisFromApiByType().then(result => {
      let toReturn = _populateWithFii(result, fiis);
      res.json(toReturn)
    })
  })
});

router.get('/type/:type', (req, res) => {
  let type = req.params.type.toUpperCase()
  _getAllFiis().then(fiis => {
    _getFiisFromApiByType().then(result => {
      let toReturn = _populateWithFii(result, fiis);
      res.json(toReturn[type])
    })
  })
});

router.get('/:cod', (req, res) => {
  let cod = req.params.cod
  _getAllFiis().then(fiis => {
    let fii = fiis.find(fii => fii.cod.toLowerCase() == cod.toLowerCase())
    if (fii) {
      _getFiisFromApiBySegment().then(result => {
        fii.segment = _getInfoFrom(result, fii);
        _getFiisFromApiByType().then(result => {
          fii.type = _getInfoFrom(result, fii);
          res.json(fii)
        })
      })
    } else {
      res.status(400).send('Fii not found.')
    }
  })
});

function _populateWithFii(result, fiis) {
  let toReturn = Object.assign({}, result)
  let keys = Object.keys(toReturn);
  keys.forEach(key => {
    let allFiisCods = toReturn[key];
    toReturn[key] = allFiisCods.map(fiiCod => {
      let fii = fiis.find(fii => fii.cod.toLowerCase() == fiiCod.toLowerCase());
      if (fii) {
        return fii;
      } else {
        return {
          cod: fiiCod
        };
      }
    });
  });
  return toReturn
}

function _getInfoFrom(result, fii) {
  let toReturn = Object.assign({}, result)
  let keys = Object.keys(toReturn);
  keys.every(function (key, index) {
    let allFiisCods = toReturn[key];
    let found = allFiisCods.find(fiiCod => fiiCod == fii.cod);
    if (found && found.length > 0) {
      toReturn = key;
      return false;
    } else {
      return true;
    }
  });
  return toReturn
}

function _getAllFiis() {
  return new Promise((resolve, reject) => {
    _getFiisFromApi().then(fiis => {
      _getFundsExplorer().then(fiisFromFundsExplorer => {
        fiis.forEach(fii => {
          fiiFromFundsExplorer = fiisFromFundsExplorer.find(fiiFromFundsExplorer => fiiFromFundsExplorer.cod == fii.cod)
          if (fiiFromFundsExplorer) {
            fii.price = fiiFromFundsExplorer.price
            fii.vp = _to2Decimal(fii.price / fii.valuePrice)
            fii.lastDyPercentage = _to2Decimal(fii.lastDy / fii.price * 100)
            fii.lastDyPercentageAnnualy = _to2Decimal(fii.lastDy / fii.price * 100 * 12)
            fii.annualAverageDyPercentage = _to2Decimal(fii.annualAverageDy / fii.price * 100 * 12)
          }
        });
        resolve(fiis)
      })
    });
  })
}

function _getFiisFromApi() {
  return new Promise((resolve, reject) => {
    if (new Date() > tablesAsJsonExpiresOn) {
      tablesAsJsonExpiresOn = new Date(new Date().getTime() + (CACHE_IN_MINUTES * 60 * 1000))
      tabletojson.convertUrl(URL, {
        stripHtmlFromCells: false
      }, (tablesAsJson) => {
        let fiis = tablesAsJson[0]
        cachedTablesAsJson = _parseFiisJson(fiis)
        resolve(cachedTablesAsJson)
      });
    } else {
      resolve(cachedTablesAsJson)
    }
  })
}

function _getFundsExplorer() {
  return new Promise((resolve, reject) => {
    if (new Date() > tablesAsJsonFromFundsExplorer_expires_on) {
      tablesAsJsonFromFundsExplorer_expires_on = new Date(new Date().getTime() + (CACHE_IN_MINUTES * 60 * 1000))
      tabletojson.convertUrl(URL_FUNDS_EXPLORER, tablesAsJsonFromFundsExplorer => {
        let fiisFromFundsExplorer = tablesAsJsonFromFundsExplorer[0]
        cachedTablesAsJsonFromFundsExplorer = _parseFiisJsonFromFundsExplorer(fiisFromFundsExplorer)
        resolve(cachedTablesAsJsonFromFundsExplorer)
      });
    } else {
      resolve(cachedTablesAsJsonFromFundsExplorer)
    }
  })
}

function _getFiisFromApiBySegment() {
  return new Promise((resolve, reject) => {
    if (new Date() > tablesAsJsonExpiresOnBySegment) {
      tablesAsJsonExpiresOnBySegment = new Date(new Date().getTime() + (CACHE_IN_MINUTES * 60 * 1000))
      tabletojson.convertUrl(URL_SEGMENTO, {
        stripHtmlFromCells: false
      }, (result) => {
        let completeTable = result[0]
        let segments = _parseListInfo(completeTable);
        cachedTablesAsJsonBySegment = segments
        resolve(cachedTablesAsJsonBySegment)
      });
    } else {
      resolve(cachedTablesAsJsonBySegment)
    }
  })
}

function _getFiisFromApiByType() {
  return new Promise((resolve, reject) => {
    if (new Date() > tablesAsJsonExpiresOnByType) {
      tablesAsJsonExpiresOnByType = new Date(new Date().getTime() + (CACHE_IN_MINUTES * 60 * 1000))
      tabletojson.convertUrl(URL_TYPE, {
        stripHtmlFromCells: false
      }, (result) => {
        let completeTable = result[0]
        let types = _parseListInfo(completeTable);
        cachedTablesAsJsonByType = types
        resolve(cachedTablesAsJsonByType)
      });
    } else {
      resolve(cachedTablesAsJsonByType)
    }
  })
}

function _parseListInfo(completeTable) {
  let types = {};
  let currentType;
  completeTable.forEach(line => {
    let columnHtml = line[0];
    let columnValue = stripHtml(columnHtml);
    let isType = columnHtml.indexOf('<strong>') >= 0;
    if (isType) {
      currentType = stripHtml(columnValue).toUpperCase();
    } else {
      columnValue = columnValue.split('*')[0].trim();
      if (!types[currentType]) {
        types[currentType] = [];
      }
      types[currentType].push(columnValue);
    }
  });
  return types;
}

function _parseFiisJsonFromFundsExplorer(fiis) {
  fiis = fiis.map(fii => _parseFiiJsonFromFundsExplorer(fii));
  return fiis
}

function _parseFiiJsonFromFundsExplorer(fii) {
  let toReturn = {}
  toReturn.cod = fii['Ativo'].split('*')[0].trim()
  toReturn.price = _parseNumber(fii['Preço de Mercado'])
  return toReturn
}

function _parseFiisJson(fiis) {
  fiis.map(fii => _parseFiiJson(fii));
  return fiis
}

function _parseFiiJson(fii) {
  fii['Código'] = stripHtml(fii['Código'])
  fii.cod = fii['Código'].split('*')[0].trim()
  fii.link = `http://fiis.com.br/${fii.cod}`
  delete fii['Código']

  fii.price = _parseNumber(fii['Cotação Usada'])
  delete fii['Cotação Usada']

  fii.valuePrice = _parseNumber(fii['Patrimônio por Cota*'])
  delete fii['Patrimônio por Cota*']

  fii.vp = _parseNumber(fii['Cotação / Patrimônio*'])
  delete fii['Cotação / Patrimônio*']

  fii.lastDy = _parseNumber(fii['ÚltimoRendimento'].split('<br>')[0])
  fii.lastDyPercentage = _parseNumber(fii['ÚltimoRendimento'].split('<br>')[1])
  fii.lastDyPercentageAnnualy = _parseNumber(fii['ÚltimoRendimento'].split('<br>')[1], 12)
  delete fii['ÚltimoRendimento']

  fii.annualAverageDy = _parseNumber(fii['Rendimento Médio (12 mêses)**'].split('<br>')[0])
  fii.annualAverageDyPercentage = _parseNumber(fii['Rendimento Médio (12 mêses)**'].split('<br>')[1])
  delete fii['Rendimento Médio (12 mêses)**']

  delete fii['N° negócios / mês']
  delete fii['N° Cotas negociadas / mês']

  fii.obs = fii['OBS'] ? stripHtml(fii['OBS']) : undefined
  delete fii['OBS']

  return fii
}

function _parseNumber(toParse, multiplier = 1) {
  return _to2Decimal(Number(toParse.split('%').join('').split('R$').join('').split('.').join('').split(',').join('.')), multiplier)
}

function _to2Decimal(toParse, multiplier = 1) {
  return parseFloat(Math.round(toParse * multiplier * 100) / 100)
}

module.exports = router;