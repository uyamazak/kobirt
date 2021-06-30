import * as L from 'leaflet'

export const defaultStyle = {
  color: '#666',
  fillColor: '#fff',
  fillOpacity: 0.85,
  weight: 1,
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
})

export const makeCorrectedStyle = styleWrapperFunc({
  color: '#999',
  fillColor: '#ccc',
  weight: 2,
})
