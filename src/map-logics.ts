import * as L from 'leaflet'
import axios from 'axios'
import { GeoJsonObject } from 'geojson'
import { getPastelColors, incorrectColors } from './colors'
import { getFullName, getFurigana } from './contents'
import {
  defaultStyle,
  makeIncorrectStyle,
  makeCorrectedStyle,
} from './layer-styles'
import { changeTileLayer } from './map-tiles'
import { changeMessage, setFlashMessage } from './message'
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
import { InitMapOptions, IntegratedLayers, AnswerResult } from './types'
import { shuffle } from './libs'

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

const updateCorrectStates = (event: AnswerResult) => {
  if (event === 'correct') {
    correctCount.value++
    changeIncorrectLevel(-2)
  } else if (event === 'incorrect') {
    incorrectCount.value++
    changeIncorrectLevel(1)
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
const isCorrectMunicipal = (code: string): boolean => {
  return code === currentMunicipal?.value?.code
}

const openTooltipTemporarily = (layer: L.Layer, timerMs = 2000) => {
  layer.openTooltip()
  setTimeout(() => layer.closeTooltip(), timerMs)
}

const isClickedByTori = (event: L.LeafletMouseEvent) => {
  if (event.sourceTarget === 'tori') {
    return true
  } else {
    return false
  }
}
const isClickedByUser = (event: L.LeafletMouseEvent) => {
  if (event.sourceTarget !== 'tori' && event.originalEvent.isTrusted) {
    return true
  } else {
    return false
  }
}

const featureClickHandler: (
  integratedLayers: IntegratedLayers
) => L.LeafletMouseEventHandlerFn = (integratedLayers) => {
  return (event) => {
    if (!isClickedByUser(event) && !isClickedByTori(event)) {
      return
    }
    const clickedLayer = event.target
    const code = getMuniCode(clickedLayer.feature)
    if (!code) {
      console.error('codeの取得に失敗しました', clickedLayer.feature)
      return
    }
    const name = getFullName(code)
    clickedLayer.bindTooltip(name, { interactive: false })
    const layers = integratedLayers[code]
    const colors = getPastelColors()
    const correctedStyle = makeCorrectedStyle({
      fillColor: colors[9],
      color: colors[0],
    })
    const incorrectStyle = makeIncorrectStyle({
      fillColor: incorrectColors[incorrectLevel.value],
    })
    const furigana = getFurigana(code)
    if (isClickedByUser(event)) {
      toriActionCount.value++
    }
    //console.log(layers)
    const isCorrected = isCorrectMunicipal(code)
    for (const layer of layers) {
      const isAlreadyCorrected = municipalityStates[code].corrected
      if (isCorrected && !isAlreadyCorrected) {
        municipalQueue.value.shift()
      }
      if (isAlreadyCorrected) {
        // すでにせいかいしたやつ
        setFlashMessage(`${furigana}\nだね`)
        layer.setStyle(correctedStyle)
      } else if (isCorrected) {
        layer.setStyle(correctedStyle)
        municipalityStates[code].corrected = true
        if (isClickedByTori(event)) {
          setFlashMessage(`ここが \n${furigana} だよ`, 5 * 1000)
          openTooltipTemporarily(clickedLayer, 5 * 1000)
        } else {
          setFlashMessage(`せいかい それが\n${furigana}`, 5 * 1000)
          updateCorrectStates('correct')
        }
      } else {
        layer.setStyle(incorrectStyle)
        setFlashMessage(`ちがうよ それは\n${furigana}`)
        updateCorrectStates('incorrect')
        openTooltipTemporarily(clickedLayer, 2000)
      }
      changeMessage()
    }
  }
}
// とびち がべつになってるから あわせたやつ
const integratedLayers: IntegratedLayers = {}

const loadGeojson = async (map: L.Map, geojson: string) => {
  isLoadingGeoJson.value = true
  const rawJson = await axios.get<GeoJsonObject>(geojson)
  const geoJsonObject = rawJson.data
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
        click: featureClickHandler(integratedLayers),
      })
    },
  })
  municipalQueue.value = shuffle<string>(municipalsTmp)
  map.addLayer(geoJson)
}

export const clickLeyer = (code: string): void => {
  if (integratedLayers[code]) {
    integratedLayers[code].forEach((layer) => {
      // 飛び地対策
      if (!municipalityStates[code].corrected) {
        layer.fireEvent('click', { sourceTarget: 'tori' })
      }
    })
  }
}

export const shuffleMunicipalQueue = () => {
  municipalQueue.value = shuffle(municipalQueue.value)
}
