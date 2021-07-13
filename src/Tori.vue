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
    <nav
      class="fixed w-full z-1000 bg-gray-100 bg-opacity-90 bottom-0 max-h-64"
    >
      <div class="flex">
        <div class="w-2/3 pt-15px relative">
          <div v-if="currentMunicipal" class="ml-5px">
            <Questioner :emoji-character="currentEmojiCharacter">
              <ruby>
                {{ currentMunicipal.countryName }} <rp>(</rp
                ><rt>{{ currentMunicipal.countryFurigana }}</rt
                ><rp>)</rp>
              </ruby>
              &nbsp;
              <ruby>
                {{ currentMunicipal.name }} <rp>(</rp
                ><rt>{{ currentMunicipal.furigana }}</rt
                ><rp>)</rp>
              </ruby>
              はどこ？
            </Questioner>
          </div>
          <div v-else-if="isComplete" class="ml-5px text-center text-sync">
            <div>ありがとう！</div>
            <div class="p-5px">
              <span v-for="emoji in thanksEmojiCharacters" :key="emoji">{{
                emoji
              }}</span>
            </div>
            <div class="text-right" @click="reset">おしまい</div>
          </div>
        </div>
        <div class="w-1/3 pt-2 text-center relative z-2000">
          <div
            v-if="message"
            class="
              flash-message
              text-sync
              inline-block
              left-5px
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
      </div>
    </nav>
    <SubMenu
      v-if="!isLoading"
      :corrected="correctCount"
      :remain="municipalQueue.length"
      @change-map-tile="changeMapTile"
    />
    <div v-if="currentMapTile" class="fixed top-0 z-2000 text-gray-500 text-xs">
      <Attribution />
    </div>
  </div>
</template>

<script lang="ts">
import * as L from 'leaflet'
import { defineComponent, onMounted, PropType } from 'vue'
import { loadContents } from './contents'
import { changeTileLayer } from './map-tiles'
import { nextEmojiCharacter } from './emoji-characters'
import { ToriConfig } from './types'
import {
  initLeafletMap,
  clickLayerByTori,
  removeAllLayersFromMap,
  loadGeojson,
} from './map-logics'
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
  currentEmojiCharacter,
  thanksEmojiCharacters,
  resetStates,
} from './states'
import ToriFront from './components/ToriFront.vue'
import ToriSide from './components/ToriSide.vue'
import Fukidashi from './components/Fukidashi.vue'
import Attribution from './components/Attribution.vue'
import Questioner from './components/Questioner.vue'
import SubMenu from './components/SubMenu.vue'

export default defineComponent({
  name: 'Tori',
  components: {
    ToriFront,
    ToriSide,
    Fukidashi,
    Attribution,
    Questioner,
    SubMenu,
  },
  props: {
    config: {
      type: Object as PropType<ToriConfig>,
      required: true,
    },
  },
  setup(props) {
    let map: L.Map
    const initApp = async () => {
      await loadGeojson(map, props.config.geoJsonUrl)
      await loadContents(props.config.contentsJsonUrl)
      nextEmojiCharacter()
      changeMessage()
    }
    onMounted(async () => {
      if (mapRef.value) {
        map = await initLeafletMap({
          mapHTMLElement: mapRef.value,
          ...props.config,
        })
        await initApp()
      }
    })

    const reset = async () => {
      resetStates()
      removeAllLayersFromMap(map)
      await initApp()
    }
    const changeMapTile = () => {
      changeTileLayer(map)
    }
    const toriClick = () => {
      if (municipalQueue.value[0]) {
        clickLayerByTori(municipalQueue.value[0])
      }
      toriActionCount.value++
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
      currentEmojiCharacter,
      thanksEmojiCharacters,
      changeMapTile,
      toriClick,
      reset,
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
  @apply absolute h-2 text-opacity-50 whitespace-pre;
}
</style>
