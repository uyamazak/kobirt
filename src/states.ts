import { ref, reactive, computed } from 'vue'
import { ContentsJSON, ContentItem } from './contents'
import { MunicipalityOptions, MapTile } from './types'

export const isLoadingGeoJson = ref<boolean>(false)
export const isLoadingContents = ref<boolean>(false)
export const isLoading = computed(() => {
  return isLoadingGeoJson.value || isLoadingContents.value
})
export const isComplete = computed(() => {
  return !isLoading.value && municipalQueue.value.length === 0
})
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
export const currentMapTile = ref<MapTile | null>(null)
export const isAttributionShown = ref(false)
export const isPrefectureHidden = ref(false)
export const currentEmojiCharacter = ref('')
export const thanksEmojiCharacters = ref<string[]>([])

export const resetStates = () => {
  toriActionCount.value = 0
  correctCount.value = 0
  incorrectCount.value = 0
  incorrectLevel.value = 0
  thanksEmojiCharacters.value = []
  currentEmojiCharacter.value = ''
  municipalQueue.value = []
  municipalityStates.value = {}
}
