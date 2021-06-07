import * as L from 'leaflet'
/**
 * https://maps.gsi.go.jp/development/ichiran.html
 */
type TileName =
  | 'seamlessphoto'
  | 'blank'
  | 'std'
  | 'pale'
  | 'relief'
  | 'english'

type MapTiles = {
  [key in TileName]: {
    name: string
    url: string
    attribution?: string
  }
}
let tileLayer: L.TileLayer | null = null
let attribution: L.Control.Attribution
const mapTiles: MapTiles = {
  blank: {
    name: '白地図',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png',
  },
  seamlessphoto: {
    name: '写真',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
    attribution: `データソース：Landsat8画像（GSI,TSIC,GEO Grid/AIST）, Landsat8画像（courtesy of the U.S. Geological Survey）, 海底地形（GEBCO）
    Images on 世界衛星モザイク画像 obtained from site https://lpdaac.usgs.gov/data_access maintained by the NASA Land Processes Distributed Active Archive Center (LP DAAC), USGS/Earth Resources Observation and Science (EROS) Center, Sioux Falls, South Dakota, (Year). Source of image data product.`,
  },
  std: {
    name: '標準地図',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    attribution: `The bathymetric contours are derived from those contained within the GEBCO Digital Atlas, published by the BODC on behalf of IOC and IHO (2003) (https://www.gebco.net)
海上保安庁許可第292502号（水路業務法第25条に基づく類似刊行物）
Shoreline data is derived from: United States. National Imagery and Mapping Agency. "Vector Map Level 0 (VMAP0)." Bethesda, MD: Denver, CO: The Agency; USGS Information Services, 1997.`,
  },
  pale: {
    name: '淡色地図',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
    attribution: `Shoreline data is derived from: United States. National Imagery and Mapping Agency. "Vector Map Level 0 (VMAP0)." Bethesda, MD: Denver, CO: The Agency; USGS Information Services, 1997.`,
  },
  relief: {
    name: '色別標高図',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
    attribution: '海域部は海上保安庁海洋情報部の資料を使用して作成',
  },
  english: {
    name: 'English',
    url: 'https://cyberjapandata.gsi.go.jp/xyz/english/{z}/{x}/{y}.png',
    attribution: `The bathymetric contours are derived from those contained within the GEBCO Digital Atlas, published by the BODC on behalf of IOC and IHO (2003) (https://www.gebco.net)
海上保安庁許可第292502号（水路業務法第25条に基づく類似刊行物）
Shoreline data is derived from: United States. National Imagery and Mapping Agency. "Vector Map Level 0 (VMAP0)." Bethesda, MD: Denver, CO: The Agency; USGS Information Services, 1997.`,
  },
}

const mapNamesGen = function* (): Generator<TileName, TileName> {
  const names = Object.keys(mapTiles) as TileName[]
  while (true) {
    for (const name of names) {
      yield name
    }
  }
}
const mapNames = mapNamesGen()

export const getMapTile = () => {
  const name = mapNames.next()
  return mapTiles[name.value]
}

export const setTileLayer = (map: L.Map) => {
  const mapTile = getMapTile()
  const attributionText = `<div class='max-h-6 overflow-y-scroll'>
          <a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>
          ${mapTile.name}
          <br>${mapTile.attribution ?? ''}
          </div>`
  tileLayer = L.tileLayer(mapTile.url, {
    attribution: attributionText,
    opacity: 0.9,
  })
  attribution = L.control.attribution({
    prefix: false,
    position: 'topleft',
  })
  attribution.addTo(map)
  tileLayer.addTo(map)
}
export const removeTileLayer = () => {
  if (tileLayer) {
    tileLayer.remove()
    attribution.remove()
  }
}

export const changeTileLayer = (map: L.Map) => {
  removeTileLayer()
  setTileLayer(map)
}
