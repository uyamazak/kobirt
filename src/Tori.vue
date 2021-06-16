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
import { defineComponent, computed, onMounted, PropType } from 'vue'
import ToriFront from './components/ToriFront.vue'
import ToriSide from './components/ToriSide.vue'
import { loadContents } from './contents'
import { changeTileLayer } from './map-tiles'
import { InitMapOptions } from './types'
import { initLeafletMap } from './map-logics'
import { changeMessage } from './message'

import {
  isLoadingGeoJson,
  isLoadingContents,
  toriActionCount,
  correctCount,
  incorrectCount,
  message,
  mapRef,
  municipalQueue,
  currentMunicipal,
  municipalityStates,
} from './states'

export default defineComponent({
  name: 'Tori',
  components: {
    ToriFront,
    ToriSide,
  },
  props: {
    initMapOptions: {
      type: Object as PropType<Omit<InitMapOptions, 'mapHTMLElement'>>,
      required: true,
    },
  },
  setup(props) {
    let map: L.Map

    onMounted(async () => {
      if (mapRef.value) {
        map = await initLeafletMap({
          mapHTMLElement: mapRef.value,
          ...props.initMapOptions,
        })
        await loadContents(props.initMapOptions.contentsJsonUrl)
        changeMessage()
      }
    })
    const toriClick = () => {
      changeTileLayer(map)
      toriActionCount.value++
    }

    const isLoading = computed(() => {
      return isLoadingGeoJson.value || isLoadingContents.value
    })

    return {
      isLoading,
      isLoadingGeoJson,
      isLoadingContents,
      currentMunicipal,
      correctCount,
      incorrectCount,
      message,
      mapRef,
      municipalityStates,
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
