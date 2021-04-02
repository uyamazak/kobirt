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
