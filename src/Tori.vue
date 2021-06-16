<template>
  <div v-if="isLoading" class="flex h-screen w-full z-3000 overflow-y-auto">
    <div class="m-auto">
      <ToriSide class="max-h-96" />
      <p class="text-center">さいたまのちずをよみこんでるよ</p>
    </div>
  </div>
  <div :class="{ invisible: isLoading }" class="overflow-y-auto">
    <div class="h-screen flex z-1">
      <div ref="mapRef" class="flex-1" />
    </div>
    <nav class="fixed w-full z-1000 bg-gray-50 bg-opacity-90 bottom-0 max-h-64">
      <div class="flex">
        <div class="w-1/3 pt-2 text-center relative">
          <div v-if="message" class="flash-message">
            <div class="fukidasi">{{ message }}</div>
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
import ToriFront from './components/ToriFront.vue'
import ToriSide from './components/ToriSide.vue'

interface ToriConfig extends Omit<InitMapOptions, 'mapHTMLElement'> {
  contentsJsonUrl: string
}
export default defineComponent({
  name: 'Tori',
  components: {
    ToriFront,
    ToriSide,
  },
  props: {
    config: {
      type: Object as PropType<ToriConfig>,
      required: true,
    },
  },
  setup(props) {
    let map: L.Map

    onMounted(async () => {
      if (mapRef.value) {
        map = await initLeafletMap({
          mapHTMLElement: mapRef.value,
          ...props.config,
        })
        await loadContents(props.config.contentsJsonUrl)
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

<style lang="scss" scoped>
.leaflet-container .leaflet-control-attribution {
  font-size: 10px;
  line-height: 1.2;
}
.flash-message {
  @apply absolute h-2 text-opacity-50 lg:text-lg text-xs whitespace-pre;
  top: -4.5em;
  left: 1.2em;
}
/* https://saruwakakun.com/html-css/reference/speech-bubble */
.fukidasi {
  @apply relative inline-block my-1em py-7px px-10px max-w-120px max-w-full leading-normal bg-white;
  color: #555;
  border: solid 2px #9a9899;
  border-radius: 10px;
}
.fukidasi:before {
  @apply absolute;
  content: "";
  bottom: -24px;
  left: 50%;
  margin-left: -16px;
  border: 12px solid transparent;
  border-top: 12px solid #FFF;
  z-index: 2;
}

.fukidasi:after {
  @apply absolute;
  content: "";
  bottom: -30px;
  left: 50%;
  margin-left: -19px;
  border: 15px solid transparent;
  border-top: 15px solid #9a9899;
  z-index: 1;
}
</style>
