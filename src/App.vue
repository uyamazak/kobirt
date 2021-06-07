<template>
  <div v-if="isLoading" class="flex h-screen w-full z-3000 overflow-y-auto">
    <div class="m-auto">
      <ToriSide class="max-h-96" />
      <p class="text-center">さいたまのちずをよみんこんでるよ</p>
    </div>
  </div>
  <div :class="{ invisible: isLoading }" class="overflow-y-auto">
    <div class="h-screen flex z-1">
      <div ref="mapRef" class="flex-1" />
    </div>
    <nav class="fixed w-full z-1000 bg-gray-50 bg-opacity-90 bottom-0 max-h-64">
      <div class="flex">
        <div class="w-1/3 pt-2 text-center">
          <div class="h-1 text-opacity-50 lg:text-lg text-xs">
            {{ message }}
          </div>
          <ToriFront
            :reverse-x="toriActionCount % 2 !== 0"
            class="max-h-64"
            @click="toriClick"
          />
        </div>
        <div class="w-2/3 pt-5 lg:text-lg">
          <div v-if="currentMunicipal">
            <ruby v-if="currentMunicipal.countryName">
              {{ currentMunicipal.countryName }} <rp>(</rp
              ><rt>{{ currentMunicipal.countryFurigana }}</rt
              ><rp>)</rp>
            </ruby>
            <ruby>
              {{ currentMunicipal.name }} <rp>(</rp
              ><rt v-if="currentMunicipal.furigana">{{
                currentMunicipal.furigana
              }}</rt
              ><rp>)</rp>
            </ruby>
            はどこ？
          </div>
          <div v-else-if="!isLoading">おわりだよ {{ currentMunicipal }}</div>
        </div>
      </div>
    </nav>
    <div
      v-if="!isLoading"
      class="fixed bottom-0 z-2000 right-5 pb-2 text-right lg:text-md text-xs"
    >
      <span class="pr-3">せいかい: {{ correctCount }}</span>
      <span class="pr-3">まちがい: {{ incorrectCount }}</span>
      <span>のこり: {{ municipalQueue.length }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import * as L from 'leaflet'
import axios from 'axios'
import { defineComponent, computed, onMounted, watch } from 'vue'
import ToriFront from './components/ToriFront.vue'
import ToriSide from './components/ToriSide.vue'
import { GeoJsonObject } from 'geojson'
import { loadContents, getContentItem, getFullName } from './contents'
import { getPastelColors, incorrectColors } from './colors'
import { changeTileLayer } from './map-tiles'
import {
  defaultStyle,
  makeIncorrectStyle,
  makeSelectedStyle,
} from './layer-styles'
import {
  isLoadingGeoJson,
  isLoadingContents,
  toriActionCount,
  correctCount,
  incorrectCount,
  incorrectLevel,
  message,
  mapRef,
  municipalQueue,
  currentMunicipal,
  contents,
  codeProps,
} from './refs'

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

export default defineComponent({
  name: 'App',
  components: {
    ToriFront,
    ToriSide,
  },
  setup() {
    let map: L.Map
    let geoJsonObject: GeoJsonObject | null = null
    let messageTimeerId = 0
    // 飛び地をあわせたもの
    const integratedLayers: { [key: string]: L.Layer[] } = {}
    const toriClick = () => {
      changeTileLayer(map)
      toriActionCount.value++
      console.log(toriActionCount.value)
    }

    onMounted(async () => {
      if (mapRef.value) {
        // 左上
        const corner1 = L.latLng(36.28881, 138.5722623)
        // 右下
        const corner2 = L.latLng(35.553613, 139.9509493)
        const bounds = L.latLngBounds(corner1, corner2)
        map = L.map(mapRef.value, {
          minZoom: 8,
          maxZoom: 13,
          maxBounds: bounds,
          doubleClickZoom: false,
          attributionControl: false,
          zoomControl: false,
          preferCanvas: true,
        }).fitWorld()
        changeTileLayer(map)
        // 中央 都幾川リバーサイドパーク
        map.setView([36.0094674, 139.4025361], 9)
      }
      await loadGeojson('/geojson/saitama.geojson')
      await loadContents('/contents-json/saitama.json')
      changeMessage()
    })

    const getMuniCode = (feature: GeoJSON.Feature): string => {
      return feature.properties?.N03_007 ?? ''
    }
    const setFlushMessage = (text: string, timeout = 3000) => {
      message.value = text
      clearTimeout(messageTimeerId)
      messageTimeerId = setTimeout(() => {
        message.value = ''
      }, timeout)
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

    const geoJsonFeatureClickHandler: L.LeafletMouseEventHandlerFn = (
      event
    ) => {
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
        if (codeProps[code].corrected) {
          layer.setStyle(
            makeSelectedStyle({
              fillColor: colors[9],
              color: colors[0],
            })
          )
          return
        }
        if (code === currentMunicipal.value.code) {
          setFlushMessage(`せいかいだよ`)
          codeProps[code].corrected = true
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

    const loadGeojson = async (geojson: string) => {
      isLoadingGeoJson.value = true
      const rawJson = await axios.get<GeoJsonObject>(geojson)
      geoJsonObject = rawJson.data
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
          codeProps[code] = { corrected: false }
          if (!municipalsTmp.includes(code)) {
            municipalsTmp.push(code)
          }
          layer.on({
            click: geoJsonFeatureClickHandler,
          })
        },
      })
      municipalQueue.value = shuffle<string>(municipalsTmp)
      map.addLayer(geoJson)
    }
    const isLoading = computed(() => {
      return isLoadingGeoJson.value || isLoadingContents.value
    })
    const currentMunicipalCode = computed(() => {
      return municipalQueue.value[0]
    })
    const changeMessage = () => {
      const code = currentMunicipalCode.value
      const item = getContentItem(code)
      if (item) {
        currentMunicipal.value = item
      }
    }
    return {
      isLoading,
      isLoadingGeoJson,
      isLoadingContents,
      currentMunicipal,
      correctCount,
      contents,
      incorrectCount,
      message,
      mapRef,
      codeProps,
      municipalQueue,
      toriActionCount,
      toriClick,
    }
  },
})
</script>

<style>
.leaflet-container .leaflet-control-attribution {
  font-size: 10px;
  line-height: 1.2;
}
</style>
