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
    var protectedDomain

    var urls = []
    for (var i = 0; i < data.length; i++) {
        var url = data[i][0]
        var label = data[i][1]
        if (label == 2) {
            protectedDomain = url
        }
    }

    for (var i = 0; i < data.length; i++) {

        if (data[i][1] == 2)
        {
            continue
        }

        var url = data[i][0].replace(/"/g, "")

        if (url.indexOf("http") != 0) {
            url = "http://" + url
        }
        urls.push(url)
        var vector = _metrics.getMetrics(url, protectedDomain)
        vectors.push(vector)
        labels.push(data[i][1])
    }
    return [vectors, labels, protectedDomain, urls]
}

function verifyTraining(dataPrepared, model) {
    var computedLabels = []
    var samples = dataPrepared[0]
    var labels = dataPrepared[1]
    var urls = dataPrepared[3]

    for (var i = 0; i < samples.length; i++) {
        var sample = samples[i]
        var label = _classifier.getLabel(sample, 2, model)
        computedLabels.push(label)
    }

    var fail = 0
    var ok = 0

    for (var j = 0; j < computedLabels.length; j++) {
        if (computedLabels[j] != labels[j]) {
            console.log(urls[j])
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
verifyTraining(dataPrepared, model)