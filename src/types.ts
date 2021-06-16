declare module 'leaflet' {
  interface Layer {
    setStyle(style: L.PathOptions): L.Layer
  }
}

interface MunicipalityOption {
  color?: string
  fillColor?: string
  selected?: boolean
  corrected?: boolean
}

export type MunicipalityOptions = { [id: string]: MunicipalityOption }
export interface LatLng {
  latitude: number
  longitude: number
}
export interface LatLngZoom {
  latitude: number
  longitude: number
  zoom: number
}
export interface InitMapOptions {
  mapHTMLElement: HTMLElement
  leftTopLatLng: LatLng
  rightBottomLatLng: LatLng
  defaultView: LatLngZoom
  minZoom: number
  maxZoom: number
  geoJsonUrl: string
}
export interface IntegratedLayers {
  [key: string]: L.Layer[]
}
