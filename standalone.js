const tabletojson = require('tabletojson')
const stripHtml = require("string-strip-html")
let myCurrentFiis = require('./prefferedFiis')

const MIN_PT = 0.8
const MIN_DY = 8

let currentFiisCod = myCurrentFiis.map(fii => fii.cod)

const METHODS = [{
        url: 'https://fiis.com.br/indicadores-estendido/',
        function: showMyDY
    },
    {
        url: 'https://fiis.com.br/indicadores-estendido/',
        function: priceValue
    }
]

// console.log(`cod\tqt`)
// myCurrentFiis.forEach(myFii => {
//     console.log(`${myFii.cod}\t${myFii.qt}`)
// });
main(METHODS[0])
main(METHODS[1])

function main(currentMethod) {
    tabletojson.convertUrl(currentMethod.url, {
        stripHtmlFromCells: false
    }, (tablesAsJson) => {
        let fiis = tablesAsJson[0]
        fiis.map(fii => fii[`Código`] = stripHtml(fii[`Código`]))
        let filteredFiis = fiis.filter(fii => currentFiisCod.includes(fii[`Código`]))
        currentMethod.function(filteredFiis)
    });
}

function showMyDY(downloadedFiis) {
    function calculateIndividualDY(myFii, completeFii) {
        let qt = myFii.qt
        let rendimento = parseToNumber(completeFii["ÚltimoRendimento"].split(`<br>`)[0].split(`R$ `)[1])

        let rendimentoTotal = qt * rendimento
        return parseFloat(Math.round(rendimentoTotal * 100) / 100)
    }

    let totalDY = 0
    downloadedFiis.forEach(completeFii => {
        let myFii = myCurrentFiis.find(fii => fii.cod == completeFii[`Código`])
        totalDY += calculateIndividualDY(myFii, completeFii);
    });
    console.log('totalDividendYield')
    console.log(totalDY)
}

function priceValue(downloadedFiis) {
    downloadedFiis = sortByCp(downloadedFiis);
    downloadedFiis = sortByDY(downloadedFiis);
    console.log('cod\tc/p\tannual yield')
    downloadedFiis.forEach(completeFii => {
        let cod = completeFii[`Código`]
        let cp = parseToNumber(completeFii["Cotação / Patrimônio*"])
        let rendimento12meses = parseToNumber(completeFii['Rendimento Médio (12 mêses)**'].split(`<br>`)[1])

        if (cp >= MIN_PT)
            if (rendimento12meses >= MIN_DY)
                console.log(`${cod}\t${cp}\t${rendimento12meses}`)

    });
}

function sortByCp(downloadedFiis) {
    let field = "Cotação / Patrimônio*"
    return downloadedFiis.sort((a, b) => {
        let aParsed = parseToNumber(a[field]);
        let bParsed = parseToNumber(b[field]);
        return aParsed - bParsed;
    });
}

function sortByDY(downloadedFiis) {
    let field = 'Rendimento Médio (12 mêses)**'
    return downloadedFiis.sort((a, b) => {
        let aParsed = parseToNumber(a[field].split(`<br>`)[1]);
        let bParsed = parseToNumber(b[field].split(`<br>`)[1]);
        return aParsed - bParsed;
    });
}

function parseToNumber(toConvert) {
    return Number(toConvert.split(',').join('.').split('%').join(''))
}