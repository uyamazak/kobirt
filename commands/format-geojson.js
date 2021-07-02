/**
 * https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_0.html#prefecture11
 * 国土数値情報からダウンロードしたgeojsonファイルから不要な値を削除し、
 * 飛び地かどうかを判定しやすくするためにproperties.IS_MAINにbool値を追加する
 **/
const fs = require('fs')
const originalGeojson = './public/geojson/saitama-orginal.geojson'
const outputGeojson = './public/geojson/saitama-formatted.geojson'

const geojsonBuffer = fs.readFileSync(originalGeojson)
const geojsonObj = JSON.parse(geojsonBuffer)
console.log(geojsonObj.features.length)
const maxCoordinates = {}

/*
飛び地を除いたメインのfeatureを判定するために
feature.geometry.coordinates[0]の数を利用する
市区町村ごとに最大値を保存し、２周目でそのfeatureにmainフラグをつける
*/
geojsonObj.features.forEach((feature) => {
  // 市区町村コード N03_007 以外は使用しないので削除
  const code = feature.properties.N03_007
  // N03_007もcode に変更
  feature.properties.code = code
  delete feature.properties.N03_001
  delete feature.properties.N03_002
  delete feature.properties.N03_003
  delete feature.properties.N03_004
  delete feature.properties.N03_007
  const coorinatesCount = feature.geometry.coordinates[0].length
  if (maxCoordinates[code]) {
    if (maxCoordinates[code] < coorinatesCount) {
      maxCoordinates[code] = coorinatesCount
    }
  } else {
    maxCoordinates[code] = coorinatesCount
  }
})
geojsonObj.features.forEach((feature) => {
  const code = feature.properties.code
  const coorinatesCount = feature.geometry.coordinates[0].length
  if (maxCoordinates[code] === coorinatesCount) {
    feature.properties.main = 1
  } else {
    feature.properties.main = 0
  }
})

fs.writeFileSync(outputGeojson, JSON.stringify(geojsonObj))
