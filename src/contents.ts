import axios from 'axios'
import { contents, isLoadingContents } from './states'

export interface ContentItem {
  code?: string
  countryName?: string
  name: string
  countryFurigana?: string
  furigana: string
  hints: string[]
}
export interface ContentsJSON {
  [key: string]: ContentItem
}

export const loadContents = async (path: string): Promise<void> => {
  isLoadingContents.value = true
  const rawJson = await axios.get<ContentsJSON>(path)
  if (!rawJson) {
    console.error('コンテンツの読込に失敗しました')
  }
  isLoadingContents.value = false
  contents.value = rawJson.data
}
export const getContentItem = (municipalCode: string) => {
  if (!contents.value) {
    console.error('コンテンツが読み込まれてません')
    return
  }
  if (!contents.value[municipalCode]) {
    console.error('コンテンツが見つかりません。code: ' + municipalCode)
    return
  }
  return {
    code: municipalCode,
    ...contents.value[municipalCode],
  }
}

export const getFullName = (municipalCode: string) => {
  return [
    getContentItem(municipalCode)?.countryName ?? null,
    getContentItem(municipalCode)?.name ?? '',
  ].join('')
}

export const getFurigana = (municipalCode: string) => {
  return getContentItem(municipalCode)?.furigana ?? ''
}
