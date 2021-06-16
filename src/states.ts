import { ref, reactive } from 'vue'
import { ContentsJSON, ContentItem } from './contents'
import { MunicipalityOptions } from './types'

export const isLoadingGeoJson = ref<boolean>(false)
export const isLoadingContents = ref<boolean>(false)
export const toriActionCount = ref<number>(0)
export const correctCount = ref<number>(0)
export const incorrectCount = ref<number>(0)
export const incorrectLevel = ref<number>(0)
export const message = ref<string>('')
export const messageTimerId = ref<number>(0)
export const mapRef = ref<HTMLElement>()
export const municipalQueue = ref<string[]>([])
export const currentMunicipal = ref<ContentItem | null>(null)
export const contents = ref<ContentsJSON>()
export const municipalityStates = reactive<MunicipalityOptions>({})
