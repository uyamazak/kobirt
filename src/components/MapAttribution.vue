<template>
  <div
    :class="{
      attributionClose: !isAttributionShown,
    }"
    class="bg-white p-3px"
  >
    <a
      class="text-blue-500 underline"
      href="https://leafletjs.com/"
      target="_blank"
      >Leaflet</a
    >
    |
    <span class="mr-5px">出典</span>
    <a
      class="text-blue-500 underline"
      href="https://maps.gsi.go.jp/development/ichiran.html"
      target="_blank"
      >地理院タイル</a
    >
    <span v-if="currentMapTile">
      {{ currentMapTile.name }} {{ currentMapTile.attribution }}
    </span>
    | 境界データは<a
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
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { currentMapTile, isAttributionShown } from '../states'

export default defineComponent({
  name: 'MapAttribution',
  props: {
    message: {
      type: String as PropType<string>,
      default: '',
    },
  },
  setup() {
    return { isAttributionShown, currentMapTile }
  },
})
</script>
<style lang="scss" scoped>
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
