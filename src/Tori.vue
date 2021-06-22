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
            class="max-h-64"
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
          <div v-else-if="!isLoading">おわりだよ {{ currentMunicipal }}</div>
        </div>
      </div>
    </nav>
    <div
      v-if="!isLoading"
      class="fixed bottom-0 z-2000 right-8px pb-8px text-right text-sync"
    >
      <span>のこり: {{ municipalQueue.length }}</span>
      <a href="https://github.com/uyamazak/kobirt" target="_blank">
        <img
          class="opacity-50 ml-8px max-w-16px lg:(max-w-32px) inline-block"
          alt="github"
          src="/img/github.png"
        />
      </a>
    </div>
    <div v-if="currentMapTile" class="fixed top-0 z-2000 text-xs">
      <div
        :class="{
          attributionOpen: isAttributionShown,
          attributionClose: !isAttributionShown,
        }"
        class="bg-white p-3px"
      >
        <span class="mr-5px">出典</span>
        <a
          class="text-blue-500 underline"
          href="https://maps.gsi.go.jp/development/ichiran.html"
          target="_blank"
          >地理院タイル</a
        >
        {{ currentMapTile.name }}
        {{ currentMapTile.attribution }} 境界データは<a
          class="text-blue-500 underline"
          href="https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_0.html"
          target="_blank"
          >「国土数値情報（行政区域データ）」（国土交通省）</a
        >を加工して利用
      </div>
      <div class="text-gray-500 text-center attributionButton">
        <button @click="isAttributionShown = !isAttributionShown">
          <span v-if="isAttributionShown">▲</span>
          <span v-else>▼</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as L from 'leaflet'
import { defineComponent, computed, onMounted, PropType } from 'vue'
import { loadContents } from './contents'
import { changeTileLayer } from './map-tiles'
import { ToriConfig } from './types'
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
  currentMapTile,
  isAttributionShown,
} from './states'
import ToriFront from './components/ToriFront.vue'
import ToriSide from './components/ToriSide.vue'
import Fukidashi from './components/Fukidashi.vue'

export default defineComponent({
  name: 'Tori',
  components: {
    ToriFront,
    ToriSide,
    Fukidashi,
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
      prefectureName: props.config.prefectureName,
      isLoading,
      currentMunicipal,
      correctCount,
      incorrectCount,
      message,
      mapRef,
      municipalQueue,
      toriActionCount,
      currentMapTile,
      isAttributionShown,
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
.attributionOpen {
}
.attributionClose {
  @apply max-h-1.5em overflow-hidden;
}
.attributionButton {
  background: linear-gradient(
    to top,
    rgba(250, 252, 252, 0) 0%,
    rgba(250, 252, 252, 0.95) 90%
  );
}
</style>
