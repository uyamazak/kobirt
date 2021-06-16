import {
  municipalQueue,
  currentMunicipal,
  message,
  messageTimerId,
} from './states'
import { getContentItem } from './contents'

const getCurrentMunicipalCode = () => {
  return municipalQueue.value[0] ?? ''
}

export const changeMessage = () => {
  const code = getCurrentMunicipalCode()
  const item = getContentItem(code)
  if (item) {
    currentMunicipal.value = item
  } else {
    currentMunicipal.value = null
  }
}

export const setFlashMessage = (text: string, timeout = 3000) => {
  message.value = text
  clearTimeout(messageTimerId.value)
  messageTimerId.value = setTimeout(() => {
    message.value = ''
  }, timeout)
}
