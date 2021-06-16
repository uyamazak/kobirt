<template>
  <Tori :config="toriConfig" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Tori from './Tori.vue'

export default defineComponent({
  name: 'App',
  components: { Tori },
  setup() {
    const toriConfig = {
      leftTopLatLng: { latitude: 36.28881, longitude: 138.5722623 },
      rightBottomLatLng: { latitude: 35.553613, longitude: 139.9509493 },
      defaultView: {
        latitude: 36.0094674,
        longitude: 139.3325361,
        zoom: 8,
      },
      minZoom: 8,
      maxZoom: 13,
      geoJsonUrl: '/geojson/saitama.geojson',
      contentsJsonUrl: '/contents-json/saitama.json',
    }
    return { toriConfig }
  },
})
</script>
