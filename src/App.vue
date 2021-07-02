<template>
  <Tori :config="toriConfig" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Tori from './Tori.vue'
import { ToriConfig } from './types'

export default defineComponent({
  name: 'App',
  components: { Tori },
  setup() {
    const latMargin = 0.8
    const longMargin = 0.9
    const saitamaNorthLat = 36.283533
    const saitamaEastLong = 139.8975563
    const saitamaWestLong = 138.7090083
    const saitamaSouthLat = 35.753577
    const toriConfig: ToriConfig = {
      prefectureName: 'さいたま',
      /*
      「国土数値情報（行政区域データ）」（国土交通省）（https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_0.html）
      commands/format-geojson.jsで加工して作成
      */
      geoJsonUrl: '/geojson/saitama-formatted.geojson',
      contentsJsonUrl: '/contents-json/saitama.json',
      northWestLatLng: {
        latitude: saitamaNorthLat + latMargin,
        longitude: saitamaWestLong - longMargin,
      },
      southEastLatLng: {
        latitude: saitamaSouthLat - latMargin,
        longitude: saitamaEastLong + longMargin,
      },
      defaultView: {
        latitude: 36.0094674,
        longitude: 139.3325361,
        zoom: 9,
      },
      minZoom: 8,
      maxZoom: 13,
    }
    return { toriConfig }
  },
})
</script>
