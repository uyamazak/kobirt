import axios from 'axios'

export interface ContentsJSON {
  [key: string]: {
    furigana: string
    hints: string[]
  }
}

export const loadContents = async (path: string): Promise<ContentsJSON> => {
  const rawJson = await axios.get<ContentsJSON>(path)
  if (!rawJson) {
    console.error('contentsの読込に失敗しました')
  }
  console.log('aaaa', rawJson.data)
  return rawJson.data
}

export const getHint = (
  contents: ContentsJSON | undefined,
  municipalName: string
) => {
  if (!contents) {
    return ''
  }
  if (!contents[municipalName]) {
    return ''
  }
  const miniHints = contents[municipalName].hints
  return miniHints[Math.floor(Math.random() * miniHints.length)]
}

export const getFurigana = (
  contents: ContentsJSON | undefined,
  municipalName: string
) => {
  if (!contents) {
    return ''
  }
  console.log(contents, municipalName)
  if (!contents[municipalName]) {
    return ''
  }
  return contents[municipalName].furigana
}
