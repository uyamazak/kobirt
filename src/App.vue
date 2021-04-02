<template>
  <div v-if="isLoading" class="flex h-screen w-full z-3000 overflow-y-auto">
    <div class="m-auto">
      <ToriSide class="max-h-96" />
      <p class="text-center">さいたま の ちず を よみんこんでる</p>
    </div>
  </div>
  <div :class="{ invisible: isLoading }" class="overflow-y-auto">
    <div class="h-screen flex z-1">
      <div ref="mapRef" class="flex-1" />
    </div>
    <nav class="fixed w-full z-1000 bg-gray-50 bg-opacity-90 bottom-0 max-h-64">
      <div class="flex">
        <div class="w-1/3 pt-2 text-center">
          <div class="h-1 text-opacity-50 text-xs">
            {{ message }}
          </div>
          <ToriFront
            :class="{
              'reverse-x': toriClickCount % 2 !== 0,
            }"
            class="max-h-64"
            @click="toriClick"
          />
        </div>
        <div class="w-2/3 pt-5">
          <div v-if="currentMunicipal">{{ currentMunicipal }}はどこだろ？</div>
          <div v-else>おわり</div>
        </div>
      </div>
    </nav>
    <div v-if="!isLoading" class="fixed bottom-0 z-2000 right-5 pb-2 text-right z-12 text-xs">
      <span class="pr-3">せいかい: {{ correctCount }}</span>
      <span class="pr-3">まちがい: {{ incorrectCount }}</span>
      <span>のこり: {{ municipalNames.length }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import * as L from 'leaflet'
import { defineComponent, ref, computed, onMounted, reactive, Ref } from 'vue'
import { GeoJsonObject } from 'geojson'
import axios from 'axios'
import ToriFront from './components/ToriFront.vue'
import ToriSide from './components/ToriSide.vue'
import { getPastelColors, incorrectColors } from './colors'
import { incorrectStyle, defaultStyle, selectedStyle } from './layer-styles'
import { getMapTile } from './map-tiles'

declare module 'leaflet' {
  interface Layer {
    setStyle(style: L.PathOptions): L.Layer
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

interface MunicipalityOption {
  color?: string
  fillColor?: string
  selected?: boolean
  corrected?: boolean
}

type MunicipalityOptions = { [id: string]: MunicipalityOption }

export default defineComponent({
  name: 'App',
  components: {
    ToriFront,
    ToriSide,
  },
  setup() {
    let GEO_JSON: GeoJsonObject | null = null
    let map: L.Map
    const isLoading = ref<boolean>(true)
    const toriClickCount = ref<number>(0)
    const correctCount = ref<number>(0)
    const incorrectCount = ref<number>(0)
    const incorrectLevel = ref<number>(0)
    const message = ref<string>('')
    const messageTimeerId = ref<number>(0)
    const mapRef = ref<HTMLElement>()
    const municipalNames = ref<string[]>([])
    const toriClick = () => {
      changeTileLayer()
      toriClickCount.value++
    }
    let codeProps = reactive<MunicipalityOptions>({})
    let tileLayer: L.TileLayer | null = null
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
        setTileLayer()
        // 中央 都幾川リバーサイドパーク
        map.setView([36.0094674, 139.4025361], 8)
      }
      loadGeojson('/geojson/saitama.geojson', municipalNames).then(() => {
        isLoading.value = false
      })
    })
    let attribution: L.Control.Attribution
    const setTileLayer = () => {
      const mapTile = getMapTile()
      const attributionText = `<div class='max-h-6 overflow-y-scroll'>
          <a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>
          ${mapTile.name}
          <br>${mapTile.attribution ?? ''}
          </div>`
      tileLayer = L.tileLayer(mapTile.url, {
        attribution: attributionText,
        opacity: 0.9,
      })
      attribution = L.control.attribution({
        prefix: false,
        position: 'topleft',
      })
      attribution.addTo(map)
      tileLayer.addTo(map)
    }
    const removeTileLayer = () => {
      if (tileLayer) {
        tileLayer.remove()
        attribution.remove()
      }
    }

    const changeTileLayer = () => {
      removeTileLayer()
      setTileLayer()
    }
    const getMuniName = (feature: GeoJSON.Feature): string => {
      return (
        (feature.properties?.N03_003 ?? '') +
        (feature.properties?.N03_004 ?? '')
      )
    }
    const setFlushMessage = (text: string, timeout = 3000) => {
      message.value = text
      clearTimeout(messageTimeerId.value)
      messageTimeerId.value = setTimeout(() => {
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
    const integratedLayers: { [key: string]: L.Layer[] } = {}
    const geoJsonFeatureClickHandler: L.LeafletMouseEventHandlerFn = (
      event
    ) => {
      if (!event.originalEvent.isTrusted) {
        return
      }
      const clickedLayer = event.target
      const code: string = clickedLayer.feature.properties.N03_007
      const name = getMuniName(clickedLayer.feature)
      const layers = integratedLayers[code]
      clickedLayer.bindTooltip(name, { interactive: true })
      for (const layer of layers) {
        const colors = getPastelColors()
        // すでに正解したやつ
        if (codeProps[code].corrected) {
          layer.setStyle(
            selectedStyle({
              fillColor: colors[9],
              color: colors[0],
            })
          )
          return
        }
        if (name === currentMunicipal.value) {
          setFlushMessage(`せいかい`)
          codeProps[code].corrected = true
          correctCount.value++
          changeIncorrectLevel(-2)
          municipalNames.value.shift()
          layer.setStyle(
            selectedStyle({
              fillColor: colors[9],
              color: colors[0],
            })
          )
        } else {
          setFlushMessage(`ちがうよ`)
          changeIncorrectLevel(1)
          incorrectCount.value++
          layer.setStyle(
            incorrectStyle({
              fillColor: incorrectColors[incorrectLevel.value],
            })
          )
          clickedLayer.openTooltip()
        }
        setTimeout(() => clickedLayer.closeTooltip(), 2000)
      }
    }

    const loadGeojson = async (
      geojson: string,
      municipalNames: Ref<string[]>
    ) => {
      const rawJson = await axios.get(geojson)
      GEO_JSON = rawJson.data
      if (GEO_JSON) {
        const municipals: string[] = []
        const geoJson = L.geoJSON(GEO_JSON, {
          style: defaultStyle,
          onEachFeature: (feature, layer) => {
            const code: string = feature.properties.N03_007
            if (integratedLayers[code]) {
              integratedLayers[code].push(layer)
            } else {
              integratedLayers[code] = [layer]
            }
            codeProps[code] = { corrected: false }
            const name: string = getMuniName(feature)
            if (!municipals.includes(name)) {
              municipals.push(name)
            }
            layer.on({
              click: geoJsonFeatureClickHandler,
            })
          },
        })
        municipalNames.value = shuffle<string>(municipals)
        map.addLayer(geoJson)
      }
    }
    const currentMunicipal = computed(() => {
      return municipalNames.value[0] ?? ''
    })
    return {
      isLoading,
      correctCount,
      incorrectCount,
      message,
      mapRef,
      codeProps,
      municipalNames,
      currentMunicipal,
      changeTileLayer,
      toriClick,
      toriClickCount,
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
