const _svm = require('typosquatting-detector/classification/2_svm')
const _metrics = require('typosquatting-detector/typosquatting-metrics')
const fs = require('fs')
const _classifier = require('typosquatting-detector/typosquatting-classification')

function getTrainingDataPath() {
    const args = process.argv.slice(2)
    var path

    args.forEach(element => {
        var name = element.split('=')[0]
        if (name == "path") {
            path = element.split('=')[1]
        }
    })
    return path
}

function getTrainingData() {
    var path = getTrainingDataPath()
    const dataRaw = fs.readFileSync(path, { encoding: 'utf8' })
    return JSON.parse(dataRaw.replace(/'/g, '"'))
}

function transformData(data) {
    var labels = []
    var vectors = []
    var protectedDomains = []
    for (var i = 0; i < data.length; i++) {
        var url = data[i][0]
        var label = data[i][1]
        if (label == 0) {
            protectedDomains.push(url)
        }
    }

    for (var i = 0; i < data.length; i++) {
        var url = data[i][0].replace(/"/g, "")

        if (url.indexOf("http") != 0) {
            url = "http://" + url
        }
        var vector = _metrics.getMetrics(url, protectedDomains)

        vectors.push(vector[0])
        labels.push(data[i][1])
    }
    return [vectors, labels, protectedDomains]
}

function verifyTraining() {
    var computedLabels = []
    for (var i = 0; i < dataPrepared[0].length; i++) {
        var label = _classifier.getLabel(dataPrepared[0][i], 2, model)
        computedLabels.push(label)
    }

    var fail = 0
    var ok = 0

    for (var j = 0; j < computedLabels.length; j++) {
        if (computedLabels[j] != dataPrepared[1][j]) {
            fail += 1
        }
        else {
            ok += 1
        }

    }

    console.log("Training accuracy")
    console.log("OK= " + ok + ", FAIL=" + fail)
}

var data = getTrainingData()
var dataPrepared = transformData(data)

var model = _svm.train(dataPrepared[0], dataPrepared[1])

console.log(JSON.stringify(model))

verifyTraining()