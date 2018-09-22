const tabletojson = require('tabletojson')
const stripHtml = require("string-strip-html")

let myCurrentFiis = [{
    cod: 'BBPO11',
    qt: 1
}, {
    cod: 'AGCX11',
    qt: 0
}, {
    cod: 'HGRE11',
    qt: 0
}, {
    cod: 'XPCM11',
    qt: 0
}, {
    cod: 'AEFI11',
    qt: 0
}, ]

let currentFiisCod = myCurrentFiis.map(fii => fii.cod)

const METHODS = [{
        url: 'https://fiis.com.br/indicadores-estendido/',
        function: priceValue
    },
    {
        url: 'https://fiis.com.br/resumo/',
        function: showMyDY
    }
]

console.log(`cod\tqt`)
myCurrentFiis.forEach(myFii => {
    console.log(`${myFii.cod}\t${myFii.qt}`)
});
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

function priceValue(downloadedFiis) {
    downloadedFiis.sort((a, b) => a["Cotação / Patrimônio*"] > b["Cotação / Patrimônio*"])
    console.log('cod\tc/p\tannual yield')
    downloadedFiis.forEach(completeFii => {
        let cod = completeFii[`Código`]
        let cp = completeFii["Cotação / Patrimônio*"]
        let rendimento12meses = completeFii['Rendimento Médio (12 mêses)**']
        rendimento12meses = rendimento12meses.split(`<br>`)[1]
        console.log(`${cod}\t${cp}\t${rendimento12meses}`)
    });
}

function showMyDY(downloadedFiis) {
    let totalDY = 0
    downloadedFiis.forEach(completeFii => {
        let myFii = myCurrentFiis.find(fii => fii.cod == completeFii[`Código`])
        totalDY += calculateIndividualDY(myFii, completeFii);
    });
    console.log('totalDividendYield')
    console.log(totalDY)
}

function calculateIndividualDY(myFii, completeFii) {
    let cod = myFii.cod
    let qt = myFii.qt
    let rendimentoParsed = completeFii['Rendimento R$'].split(',').join('.')
    rendimentoParsed = Number(rendimentoParsed)
    let rendimentoTotal = qt * rendimentoParsed
    return parseFloat(Math.round(rendimentoTotal * 100) / 100)
}