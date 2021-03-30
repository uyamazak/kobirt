<template>
<div class="h-screen w-full z-20" v-show="isLoading">
  <ToriSide class="max-h-96"/>
  <p class="text-center">さいたま の ちず を よみんこんでるよ</p>
</div>
<div :class="{invisible:isLoading}">
  <div class="h-screen flex z-1">
    <div ref="mapRef" class="flex-1 overflow-y-auto"></div>
  </div>
  <nav class="fixed w-full z-1000 bg-gray-50 bottom-0 max-h-64">
    <div class="flex">
      <div class="w-1/3 pt-2 text-center">
        <div class="h-1  text-opacity-50 text-xs">{{ message }}</div>
        <ToriFront class="max-h-64" />
      </div>
      <div class="w-2/3 pt-5">
        <div v-if="currentMunicipal">{{ currentMunicipal }}はどこ？</div>
        <div v-else>おわり？</div>
      </div>
    </div>
  </nav>
  <div class="fixed bottom-1 z-2000 right-2 pb-2 text-right z-12 text-xs ">
    <span class="pr-2">せいかい：{{ correctCount }}</span>
    <span>まちがい：{{ incorrectCount }}</span>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, reactive, Ref } from 'vue'
import * as L  from 'leaflet'
import { GeoJsonObject } from 'geojson'
import axios from 'axios'
import ToriFront from './components/ToriFront.vue'
import ToriSide from './components/ToriSide.vue'
import { getPastelColors, incorrectColors } from './colors'
import { incorrectStyle, defaultStyle , selectedStyle } from './layer-styles'
import "leaflet/dist/leaflet.css"
/**
 * https://maps.gsi.go.jp/development/ichiran.html
 */
const mapTiles = {
  seamlessphoto: 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
  blank: 'https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png',
  std: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
  pale: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
}
const getMapTile = () => {
  return mapTiles.blank
}


function shuffle<T>(array: T[]) {
  let currentIndex = array.length
  let temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

interface MunicipalityOption {
  color?: string
  fillColor?: string
  selected?: boolean
  corrected?: boolean
}

type MunicipalityOptions = {[id:string]: MunicipalityOption}

export default defineComponent({
  name: 'App',
  components: {
    ToriFront,
    ToriSide,
  },
  setup() {
    let GEO_JSON: GeoJsonObject|null = null
    let map: L.Map
    const isLoading = ref<boolean>(true)
    const correctCount = ref<number>(0)
    const incorrectCount = ref<number>(0)
    const incorrectLevel = ref<number>(0)
    const message = ref<string>('')
    const messageTimeerId = ref<number>(0)
    const mapRef = ref<HTMLElement>()
    const municipalNames = ref<string[]>([])
    let codeProps = reactive<MunicipalityOptions>({})
    onMounted(async () => {
      if (mapRef.value) {
        // 左上
        const corner1 = L.latLng(36.28881,138.5722623)
        // 右下
        const corner2 = L.latLng(35.553613,139.9509493)
        const bounds = L.latLngBounds(corner1, corner2)
        map = L.map(mapRef.value, {
          minZoom: 8,
          maxZoom: 16,
          maxBounds: bounds,
          doubleClickZoom: false,
        }).fitWorld();
        L.tileLayer(getMapTile(), {
          attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
          opacity: 0.5,
        }).addTo(map);
        // 中央 都幾川リバーサイドパーク
        map.setView([36.0094674,139.4025361], 8);
      }
      await loadGeojson('/geojson/saitama.geojson', municipalNames)
      isLoading.value = false
    })

    const getMuniName = (feature: GeoJSON.Feature): string => {
      return (feature.properties?.N03_003 ?? '') + (feature.properties?.N03_004 ?? '')
    }
    const setFlushMessage = (text:string, timeout=3000) => {
      message.value = text
      clearTimeout(messageTimeerId.value)
      messageTimeerId.value = setTimeout(() => {
        message.value = ''
      }, timeout)
    }

    const changeIncorrectLevel = (num: number) => {
      incorrectLevel.value += num
      const max = 14
      if (incorrectLevel.value < 0) {
        incorrectLevel.value = 0
      } else if (incorrectLevel.value >= max) {
        incorrectLevel.value = max
      }
    }

    const loadGeojson = async (geojson: string, municipalNames:Ref<string[]>) => {
      const rawJson = await axios.get(geojson)
      GEO_JSON = rawJson.data
      if (GEO_JSON) {
        const municipals: string[]= []
        const layer = L.geoJSON(GEO_JSON,
        {
            style: defaultStyle,
            onEachFeature: (feature, layer) => {
              const code: string = feature.properties.N03_007
              codeProps[code] = {corrected: false}
              const name: string = getMuniName(feature)
              municipals.push(name)

              layer.on({
                  click: (event) => {
                    if(!event.originalEvent.isTrusted) {
                      return
                    }
                    const layer = event.target
                    const code: string = layer.feature.properties.N03_007
                    const name =  getMuniName(layer.feature)
                    layer.bindTooltip(name, {interactive: false})
                    const colors = getPastelColors()
                    if (codeProps[code].corrected) {
                      selectedStyle.fillColor = colors[9]
                      selectedStyle.color = colors[0]
                      layer.setStyle(selectedStyle)
                      return
                    }
                    if (name === currentMunicipal.value) {
                      codeProps[code].corrected = true
                      setFlushMessage('せいかい')
                      correctCount.value++
                      changeIncorrectLevel(-1)
                      municipalNames.value.shift()
                      selectedStyle.fillColor = colors[9]
                      selectedStyle.color = colors[0]
                      layer.setStyle(selectedStyle)
                    } else {
                      setFlushMessage(`ちがうよ`)
                      changeIncorrectLevel(1)
                      incorrectCount.value++
                      incorrectStyle.fillColor = incorrectColors[incorrectLevel.value]
                      console.log(incorrectLevel.value)
                      layer.setStyle(incorrectStyle)
                      layer.openTooltip()
                    }
                    setTimeout(() => layer.closeTooltip(), 2000)
                    //console.log(event)
                  }
              })
            }
        })
        municipalNames.value = shuffle<string>(municipals)
        map.addLayer(layer)
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
    }
  },
})
</script>

<style>
</style>
