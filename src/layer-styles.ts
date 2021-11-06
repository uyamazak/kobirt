import * as L from 'leaflet'

export const defaultStyle = {
  color: '#666',
  fillColor: '#fff',
  fillOpacity: 1,
  weight: 2,
  opacity: 1,
}

const styleWrapperFunc = (
  initialStyle: Partial<L.PathOptions>
): ((options: Partial<L.PathOptions>) => Partial<L.PathOptions>) => {
  return (options: Partial<L.PathOptions>) => {
    return {
      ...initialStyle,
      ...options,
    }
  }
}

export const makeIncorrectStyle = styleWrapperFunc({
  color: '#999',
  fillColor: '#aaa',
  fillOpacity: 0.7,
  weight: 2,
  opacity: 1,
})

export const makeSelectedStyle = styleWrapperFunc({
  color: '#ccc',
  fillColor: '#ccc',
  fillOpacity: 0.95,
  weight: 3,
  opacity: 1,
})
