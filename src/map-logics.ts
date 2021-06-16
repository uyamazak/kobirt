import * as L from 'leaflet'
import axios from 'axios'
import { getPastelColors, incorrectColors } from './colors'
import {
  isLoadingGeoJson,
  toriActionCount,
  correctCount,
  incorrectCount,
  incorrectLevel,
  municipalQueue,
  currentMunicipal,
  municipalityStates,
} from './states'
import { InitMapOptions, IntegratedLayers } from './types'
import { changeTileLayer } from './map-tiles'
import { getFullName } from './contents'
import {
  defaultStyle,
  makeIncorrectStyle,
  makeSelectedStyle,
} from './layer-styles'
import { GeoJsonObject } from 'geojson'
import { changeMessage, setFlushMessage } from './message'

const getMuniCode = (feature: GeoJSON.Feature): string => {
  return feature.properties?.N03_007 ?? ''
}

const changeIncorrectLevel = (num: number) => {
  incorrectLevel.value += num
  const max = incorrectColors.length - 1
  if (incorrectLevel.value < 0) {
    incorrectLevel.value = 0
  } else if (incorrectLevel.value >= max) {
    incorrectLevel.value = max
  }
}
export const initLeafletMap = async (
  options: InitMapOptions
): Promise<L.Map> => {
  const {
    mapHTMLElement,
    leftTopLatLng,
    rightBottomLatLng,
    defaultView,
    minZoom,
    maxZoom,
    geoJsonUrl,
  } = { ...options }
  // 左上
  const leftTop = L.latLng(leftTopLatLng.latitude, leftTopLatLng.longitude)
  // 右下
  const rightBottom = L.latLng(
    rightBottomLatLng.latitude,
    rightBottomLatLng.longitude
  )
  const bounds = L.latLngBounds(leftTop, rightBottom)
  const map = L.map(mapHTMLElement, {
    minZoom,
    maxZoom,
    maxBounds: bounds,
    doubleClickZoom: false,
    attributionControl: false,
    zoomControl: false,
    preferCanvas: true,
  }).fitWorld()
  changeTileLayer(map)
  map.setView([defaultView.latitude, defaultView.longitude], defaultView.zoom)
  await loadGeojson(map, geoJsonUrl)
  return map
}
const geoJsonFeatureClickHandler: (
  integratedLayers: IntegratedLayers
) => L.LeafletMouseEventHandlerFn = (integratedLayers) => {
  return (event) => {
    if (!event.originalEvent.isTrusted) {
      return
    }
    toriActionCount.value++
    const clickedLayer = event.target
    const code = getMuniCode(clickedLayer.feature)
    if (!code) {
      console.error('codeの取得に失敗しました', clickedLayer.feature)
      return
    }
    const name = getFullName(code)
    const layers = integratedLayers[code]
    clickedLayer.bindTooltip(name, { interactive: true })
    const colors = getPastelColors()
    const selectedStyle = makeSelectedStyle({
      fillColor: colors[9],
      color: colors[0],
    })
    const incorrectStyle = makeIncorrectStyle({
      fillColor: incorrectColors[incorrectLevel.value],
    })
    for (const layer of layers) {
      // すでに正解したやつ
      if (municipalityStates[code].corrected) {
        layer.setStyle(
          makeSelectedStyle({
            fillColor: colors[9],
            color: colors[0],
          })
        )
        return
      }
      if (code === (currentMunicipal?.value?.code ?? '')) {
        setFlushMessage(`せいかいだよ`)
        municipalityStates[code].corrected = true
        correctCount.value++
        changeIncorrectLevel(-2)
        municipalQueue.value.shift()
        layer.setStyle(selectedStyle)
      } else {
        setFlushMessage(`ちがうよ`)
        changeIncorrectLevel(1)
        incorrectCount.value++
        layer.setStyle(incorrectStyle)
        clickedLayer.openTooltip()
        setTimeout(() => clickedLayer.closeTooltip(), 2000)
      }
      changeMessage()
    }
  }
}

/**
 * @url https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length
  let temporaryValue, randomIndex
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  return array
}

const loadGeojson = async (map: L.Map, geojson: string) => {
  isLoadingGeoJson.value = true
  const rawJson = await axios.get<GeoJsonObject>(geojson)
  const geoJsonObject = rawJson.data
  // 飛び地をあわせたもの
  const integratedLayers: IntegratedLayers = {}

  isLoadingGeoJson.value = false
  if (!geoJsonObject) {
    console.error('geojsonの読み込みに失敗しました')
    return
  }
  const municipalsTmp: string[] = []
  const geoJson = L.geoJSON(geoJsonObject, {
    style: defaultStyle,
    onEachFeature: (feature, layer) => {
      const code = getMuniCode(feature)
      if (integratedLayers[code]) {
        integratedLayers[code].push(layer)
      } else {
        integratedLayers[code] = [layer]
      }
      municipalityStates[code] = { corrected: false }
      if (!municipalsTmp.includes(code)) {
        municipalsTmp.push(code)
      }
      layer.on({
        click: geoJsonFeatureClickHandler(integratedLayers),
      })
    },
  })
  municipalQueue.value = shuffle<string>(municipalsTmp)
  map.addLayer(geoJson)
}
