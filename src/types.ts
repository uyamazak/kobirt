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
export interface LatLngZoom extends LatLng {
  zoom: number
}
export interface IntegratedLayers {
  [key: string]: L.Layer[]
}
export interface InitMapOptions {
  prefectureName: string
  mapHTMLElement: HTMLElement
  leftTopLatLng: LatLng
  rightBottomLatLng: LatLng
  defaultView: LatLngZoom
  minZoom: number
  maxZoom: number
  geoJsonUrl: string
}
export interface ToriConfig extends Omit<InitMapOptions, 'mapHTMLElement'> {
  contentsJsonUrl: string
}

export type AnswerResult = 'correct' | 'incorrect'

/**
 * https://maps.gsi.go.jp/development/ichiran.html
 */
export type TileName =
  | 'seamlessphoto'
  | 'blank'
  | 'std'
  | 'pale'
  | 'relief'
  | 'english'

export type MapTile = {
  name: string
  url: string
  attribution?: string
}
export type MapTiles = {
  [key in TileName]: MapTile
}
