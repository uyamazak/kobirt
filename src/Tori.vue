<template>
  <div v-if="isLoading" class="flex h-screen w-full z-3000 overflow-y-auto">
    <div class="m-auto">
      <ToriSide class="max-h-96" />
      <p class="text-center">{{ prefectureName }} のちずを よみこんでるよ</p>
    </div>
  </div>
  <div :class="{ invisible: isLoading }" class="overflow-y-auto">
    <div class="h-screen flex z-1">
      <div ref="mapRef" class="flex-1" />
    </div>
    <nav class="fixed w-full z-1000 bg-gray-50 bg-opacity-90 bottom-0 max-h-64">
      <div class="flex">
        <div class="w-1/3 pt-2 text-center relative">
          <div
            v-if="message"
            class="
              flash-message
              text-sync
              inline-block
              left-1/10
              top-[-60px]
              sm:(left-1/5)
              md:(left-1/4
              top-[-65px])
              lg:(left-1/3
              top-[-70px])
            "
          >
            <Fukidashi :message="message" />
          </div>
          <ToriFront
            :reverse-x="toriActionCount % 2 !== 0"
            class="max-h-64 select-none"
            @click="toriClick"
          />
        </div>
        <div class="w-2/3 pt-5 text-sync-lg">
          <div v-if="currentMunicipal">
            <ruby>
              {{ currentMunicipal.countryFurigana }} <rp>(</rp
              ><rt>{{ currentMunicipal.countryName }}</rt
              ><rp>)</rp>
            </ruby>
            &nbsp;
            <ruby>
              {{ currentMunicipal.furigana }} <rp>(</rp
              ><rt>{{ currentMunicipal.name }}</rt
              ><rp>)</rp>
            </ruby>
            はどこ？
          </div>
          <div v-else-if="isComplete">おしまい</div>
        </div>
      </div>
    </nav>
    <ul v-if="!isLoading" class="sub-menu text-sync">
      <li>
        <button class="text-xl lg:(text-3xl)" @click="changeMapTile">🗾</button>
      </li>
      <li>
        <button class="text-xl lg:(text-3xl)" @click="togglePrefecture">
          🥷
        </button>
      </li>
      <li>
        <span>せいかい: {{ correctCount }}</span>
      </li>
      <li>
        <span>のこり: {{ municipalQueue.length }}</span>
      </li>
      <li>
        <a href="https://github.com/uyamazak/kobirt" target="_blank">
          <img
            class="opacity-50 ml-8px max-w-16px lg:(max-w-32px) inline-block"
            alt="github"
            src="/img/github.png"
          />
        </a>
      </li>
    </ul>
    <div v-if="currentMapTile" class="fixed top-0 z-2000 text-gray-500 text-xs">
      <Attribution />
    </div>
  </div>
</template>

<script lang="ts">
import * as L from 'leaflet'
import { defineComponent, onMounted, PropType, ref } from 'vue'
import { loadContents } from './contents'
import { changeTileLayer } from './map-tiles'
import { ToriConfig } from './types'
import { initLeafletMap, clickLeyer, setStyleToAllLayer } from './map-logics'
import { changeMessage } from './message'
import {
  isLoading,
  isComplete,
  toriActionCount,
  correctCount,
  incorrectCount,
  message,
  mapRef,
  municipalQueue,
  currentMunicipal,
  currentMapTile,
  isAttributionShown,
} from './states'
import ToriFront from './components/ToriFront.vue'
import ToriSide from './components/ToriSide.vue'
import Fukidashi from './components/Fukidashi.vue'
import Attribution from './components/Attribution.vue'

export default defineComponent({
  name: 'Tori',
  components: {
    ToriFront,
    ToriSide,
    Fukidashi,
    Attribution,
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
    const changeMapTile = () => {
      changeTileLayer(map)
    }
    const toriClick = () => {
      if (municipalQueue.value[0]) {
        clickLeyer(municipalQueue.value[0])
      }
      toriActionCount.value++
    }
    const hidePrefecture = ref(false)
    const togglePrefecture = () => {
      hidePrefecture.value = !hidePrefecture.value
      if (hidePrefecture.value) {
        setStyleToAllLayer({ fillOpacity: 0.1 })
      } else {
        setStyleToAllLayer({ fillOpacity: 0.9 })
      }
    }

    return {
      prefectureName: props.config.prefectureName,
      isLoading,
      isComplete,
      currentMunicipal,
      correctCount,
      incorrectCount,
      message,
      mapRef,
      municipalQueue,
      toriActionCount,
      currentMapTile,
      isAttributionShown,
      togglePrefecture,
      changeMapTile,
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
.text-sync {
  @apply text-xs sm:text-sm md:text-base lg:text-lg;
}
.text-sync-lg {
  @apply text-sm sm:text-base md:text-lg lg:text-xl;
}
.flash-message {
  @apply absolute h-2 text-opacity-50 whitespace-pre;
}
.sub-menu {
  @apply fixed bottom-0 z-2000 right-8px pb-8px text-right;
  li {
    @apply inline-block mr-5px align-middle lg:(mr-20px);
  }
}
</style>
