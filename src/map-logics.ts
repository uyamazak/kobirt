import * as L from 'leaflet'
import axios from 'axios'
import { GeoJsonObject } from 'geojson'
import { getPastelColors, incorrectColors } from './colors'
import { getFullName, getFurigana } from './contents'
import {
  defaultStyle,
  makeIncorrectStyle,
  makeCorrectedStyle,
  defaultFillOpacity,
} from './layer-styles'
import { changeTileLayer } from './map-tiles'
import { nextEmojiCharacter } from './emoji-characters'
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
  isPrefectureHidden,
} from './states'
import { InitMapOptions, IntegratedLayers, AnswerResult } from './types'
import { shuffle } from './libs'

const getMuniCode = (feature: GeoJSON.Feature): string => {
  return feature.properties?.code ?? ''
}
const isMainLayer = (layer: L.Layer): boolean => {
  return layer.feature?.properties?.main === 1
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
    northWestLatLng,
    southEastLatLng,
    defaultView,
    minZoom,
    maxZoom,
    geoJsonUrl,
  } = { ...options }
  // 左上
  const leftTop = L.latLng(northWestLatLng.latitude, northWestLatLng.longitude)
  // 右下
  const rightBottom = L.latLng(
    southEastLatLng.latitude,
    southEastLatLng.longitude
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
  return map
}
const isCorrectMunicipal = (code: string): boolean => {
  return code === currentMunicipal?.value?.code
}

const openTooltipTemporarily = (layer: L.Layer, timerMs = 2000) => {
  closeAllTooltips()
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
  integratedLayers: IntegratedLayers,
  map: L.Map
) => L.LeafletMouseEventHandlerFn = (integratedLayers, map) => {
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
    clickedLayer.bindTooltip(name, {
      interactive: false,
      direction: 'top',
      offset: [0, -5],
    })
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
    const isAlreadyCorrected = municipalityStates[code].corrected ?? false
    const isCorrected = isCorrectMunicipal(code)
    // 最初の正解
    if (isCorrected && !isAlreadyCorrected) {
      municipalityStates[code].corrected = true
      municipalQueue.value.shift()
      nextEmojiCharacter()
    }
    const layerGroup = integratedLayers[code]
    layerGroup.eachLayer((layer) => {
      if (isAlreadyCorrected) {
        // すでにせいかいしたやつ
        setFlashMessage(`${furigana}\nだね`)
        layer.setStyle(correctedStyle)
      } else if (isCorrected) {
        layer.setStyle(correctedStyle)
        if (isClickedByTori(event)) {
          setFlashMessage(`ここが \n${furigana} だよ`, 5 * 1000)
          openTooltipTemporarily(clickedLayer, 5 * 1000)
          map.flyTo(layer.getCenter(), 10, {
            duration: 0.2,
            easeLinearity: 0.1,
          })
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
    })
  }
}
// とびち がべつになってるから あわせたやつ
const integratedLayers: IntegratedLayers = {}
// すべてのレイヤー
const allLeyers: L.LayerGroup = L.layerGroup()

export const loadGeojson = async (map: L.Map, geojson: string) => {
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
      allLeyers.addLayer(layer)
      if (integratedLayers[code]) {
        integratedLayers[code].addLayer(layer)
      } else {
        integratedLayers[code] = L.layerGroup([layer])
      }
      municipalityStates[code] = { corrected: false }
      if (!municipalsTmp.includes(code)) {
        municipalsTmp.push(code)
      }
      layer.on({
        click: featureClickHandler(integratedLayers, map),
      })
    },
  })
  municipalQueue.value = shuffle<string>(municipalsTmp)
  map.addLayer(geoJson as L.Layer)
}

export const clickLayerByTori = (code: string): void => {
  if (integratedLayers[code]) {
    integratedLayers[code].eachLayer((layer) => {
      // 飛び地対策, mainだけクリックする
      if (!isMainLayer(layer)) {
        return
      }
      layer.fireEvent('click', { sourceTarget: 'tori' })
    })
  }
}

export const shuffleMunicipalQueue = () => {
  municipalQueue.value = shuffle(municipalQueue.value)
}

export const setStyleToAllLayer = (style: L.PathOptions) => {
  allLeyers.eachLayer((layer) => {
    layer.setStyle(style)
  })
}

export const closeAllTooltips = () => {
  allLeyers.eachLayer((layer) => {
    layer.closeTooltip()
  })
}

export const togglePrefecture = () => {
  isPrefectureHidden.value = !isPrefectureHidden.value
  if (isPrefectureHidden.value) {
    setStyleToAllLayer({ fillOpacity: 0 })
  } else {
    setStyleToAllLayer({ fillOpacity: defaultFillOpacity })
  }
}

export const removeAllLayersFromMap = (map: L.Map) => {
  allLeyers.eachLayer((layer) => {
    map.removeLayer(layer)
  })
  for (const l in integratedLayers) {
    delete integratedLayers[l]
  }
}
