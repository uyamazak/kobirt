<template>
  <div ref="mapRef" class="h-screen"></div>
  <ToriSide />
  <ToriFront />

</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import * as L  from 'leaflet'
import { GeoJsonObject } from 'geojson'
import axios from 'axios'
import ToriFront from './components/ToriFront.vue'
import ToriSide from './components/ToriSide.vue'
import "leaflet/dist/leaflet.css"

let GEO_JSON: GeoJsonObject|null = null;
let map: L.Map;


export default defineComponent({
  name: 'App',
  components: {
    ToriFront,
    ToriSide,
  },
  setup() {
    const mapRef = ref<HTMLElement>()

    onMounted(() => {
      if (mapRef.value) {
        map = L.map(mapRef.value);
        L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
          attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
        }).addTo(map);
        map.setView([35.3622222, 138.7313889], 8);
      }
    })

    const fetchLayer = async () => {
      const rawJson = await axios.get('/geojson/N03-20_11_200101.geojson')
      GEO_JSON = rawJson.data
      if (GEO_JSON) {
        const layer = L.geoJSON(GEO_JSON)
        map.addLayer(layer)
      }
    }
    const getGeoJson = computed(() => {
      return GEO_JSON
    })
    fetchLayer()
    return {
      getGeoJson,
      mapRef
    }
  },
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
