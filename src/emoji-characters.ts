import { numberGen, shuffle } from './libs'
import { currentEmojiCharacter, thanksEmojiCharacters } from './states'
/*https://getemoji.com/*/

const splitedEmojis = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '🥲',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🥸',
  '🤩',
  '🥳',
  '😏',
  '😒',
  '😞',
  '😔',
  '😟',
  '😕',
  '🙁',
  '😣',
  '😖',
  '😫',
  '😩',
  '🥺',
  '😢',
  '😭',
  '😤',
  '😠',
  '😡',
  '🤬',
  '🤯',
  '😳',
  '😥',
  '😓',
  '🤗',
  '🤔',
  '🤭',
  '🤫',
  '🤥',
  '😶',
  '😐',
  '😑',
  '😬',
  '🙄',
  '😯',
  '😦',
  '😧',
  '😮',
  '😲',
  '🥱',
  '😴',
  '🤤',
  '😪',
  '😵',
  '🤐',
  '🥴',
  '🤧',
  '😷',
  '🤕',
  '🤑',
  '🤠',
  '😈',
  '👿',
  '👹',
  '👺',
  '🤡',
  '💩',
  '👻',
  '💀',
  '👽',
  '👾',
  '🤖',
  '🎃',
  '😺',
  '😸',
  '😹',
  '😻',
  '😼',
  '😽',
  '🙀',
  '😿',
  '😾',
  '👶',
  '👧',
  '🧒',
  '👦',
  '👩',
  '🧑',
  '👨',
  '👩‍🦱',
  '🧑‍🦱',
  '👨‍🦱',
  '👩‍🦰',
  '🧑‍🦰',
  '👨‍🦰',
  '👱‍♀️',
  '👱',
  '👱‍♂️',
  '👩‍🦳',
  '🧑‍🦳',
  '👨‍🦳',
  '👩‍🦲',
  '🧑‍🦲',
  '👨‍🦲',
  '🧔',
  '👵',
  '🧓',
  '👴',
  '👲',
  '👳‍♀️',
  '👳',
  '👳‍♂️',
  '🧕',
  '👮‍♀️',
  '👮',
  '👮‍♂️',
  '👷‍♀️',
  '👷',
  '👷‍♂️',
  '💂‍♀️',
  '💂',
  '💂‍♂️',
  '🕵️‍♀️',
  '🕵️',
  '🕵️‍♂️',
  '👩‍⚕️',
  '🧑‍⚕️',
  '👨‍⚕️',
  '👩‍🌾',
  '🧑‍🌾',
  '👨‍🌾',
  '👩‍🍳',
  '🧑‍🍳',
  '👨‍🍳',
  '👩‍🎓',
  '🧑‍🎓',
  '👨‍🎓',
  '👩‍🎤',
  '🧑‍🎤',
  '👨‍🎤',
  '👩‍🏫',
  '🧑‍🏫',
  '👨‍🏫',
  '👩‍🏭',
  '🧑‍🏭',
  '👨‍🏭',
  '👩‍💻',
  '🧑‍💻',
  '👨‍💻',
  '👩‍💼',
  '🧑‍💼',
  '👨‍💼',
  '👩‍🔧',
  '🧑‍🔧',
  '👨‍🔧',
  '👩‍🔬',
  '🧑‍🔬',
  '👨‍🔬',
  '👩‍🎨',
  '🧑‍🎨',
  '👨‍🎨',
  '👩‍🚒',
  '🧑‍🚒',
  '👨‍🚒',
  '👩‍✈️',
  '🧑‍✈️',
  '👨‍✈️',
  '👩‍🚀',
  '🧑‍🚀',
  '👨‍🚀',
  '👩‍⚖️',
  '🧑‍⚖️',
  '👨‍⚖️',
  '👰‍♀️',
  '👰',
  '👰‍♂️',
  '🤵‍♀️',
  '🤵',
  '🤵‍♂️',
  '👸',
  '🤴',
  '🥷',
  '🦸‍♀️',
  '🦸',
  '🦸‍♂️',
  '🦹‍♀️',
  '🦹',
  '🦹‍♂️',
  '🤶',
  '🧑‍🎄',
  '🎅',
  '🧙‍♀️',
  '🧙',
  '🧙‍♂️',
  '🧝‍♀️',
  '🧝',
  '🧝‍♂️',
  '🧛‍♀️',
  '🧛',
  '🧛‍♂️',
  '🧟‍♀️',
  '🧟',
  '🧟‍♂️',
  '🧞‍♀️',
  '🧞',
  '🧞‍♂️',
  '🧜‍♀️',
  '🧜',
  '🧜‍♂️',
  '🧚‍♀️',
  '🧚',
  '🧚‍♂️',
  '👼',
  '🤰',
  '🤱',
  '👩‍🍼',
  '🧑‍🍼',
  '👨‍🍼',
  '🙇‍♀️',
  '🙇',
  '🙇‍♂️',
  '💁‍♀️',
  '💁',
  '💁‍♂️',
  '🙅‍♀️',
  '🙅',
  '🙅‍♂️',
  '🙆‍♀️',
  '🙆',
  '🙆‍♂️',
  '🙋‍♀️',
  '🙋',
  '🙋‍♂️',
  '🧏‍♀️',
  '🧏',
  '🧏‍♂️',
  '🤦‍♀️',
  '🤦',
  '🤦‍♂️',
  '🤷‍♀️',
  '🤷',
  '🤷‍♂️',
  '🙎‍♀️',
  '🙎',
  '🙎‍♂️',
  '🙍‍♀️',
  '🙍',
  '🙍‍♂️',
  '💇‍♀️',
  '💇',
  '💇‍♂️',
  '💆‍♀️',
  '💆',
  '💆‍♂️',
  '🧖‍♀️',
  '🧖',
  '🧖‍♂️',
  '💅',
  '🤳',
  '💃',
  '🕺',
  '👯‍♀️',
  '👯',
  '👯‍♂️',
  '🕴',
  '👩‍🦽',
  '🧑‍🦽',
  '👨‍🦽',
  '👩‍🦼',
  '🧑‍🦼',
  '👨‍🦼',
  '🚶‍♀️',
  '🚶',
  '🚶‍♂️',
  '👩‍🦯',
  '🧑‍🦯',
  '👨‍🦯',
  '🧎‍♀️',
  '🧎',
  '🧎‍♂️',
  '🏃‍♀️',
  '🏃',
  '🏃‍♂️',
  '🧍‍♀️',
  '🧍',
  '🧍‍♂️',
  '👭',
  '🧑‍🤝‍🧑',
  '👬',
  '👫',
  '🐶',
  '🐱',
  '🐭',
  '🐹',
  '🐰',
  '🦊',
  '🐻',
  '🐼',
  '🐻',
  '🐨',
  '🐯',
  '🦁',
  '🐮',
  '🐷',
  '🐽',
  '🐸',
  '🐵',
  '🙈',
  '🙉',
  '🙊',
  '🐒',
  '🐔',
  '🐧',
  '🐦',
  '🐤',
  '🐣',
  '🐥',
  '🦆',
  '🦅',
  '🦉',
  '🦇',
  '🐺',
  '🐗',
  '🐴',
  '🦄',
  '🐝',
  '🪱',
  '🐛',
  '🦋',
  '🐌',
  '🐞',
  '🐜',
  '🪰',
  '🪲',
  '🪳',
  '🦟',
  '🦗',
  '🕷',
  '🦂',
  '🐢',
  '🐍',
  '🦎',
  '🦖',
  '🦕',
  '🐙',
  '🦑',
  '🦐',
  '🦞',
  '🦀',
  '🐡',
  '🐠',
  '🐟',
  '🐬',
  '🐳',
  '🐋',
  '🦈',
  '🐊',
  '🐅',
  '🐆',
  '🦓',
  '🦍',
  '🦧',
  '🦣',
  '🐘',
  '🦛',
  '🦏',
  '🐪',
  '🐫',
  '🦒',
  '🦘',
  '🦬',
  '🐃',
  '🐂',
  '🐄',
  '🐎',
  '🐖',
  '🐏',
  '🐑',
  '🦙',
  '🐐',
  '🦌',
  '🐕',
  '🐩',
  '🦮',
  '🐕‍🦺',
  '🐈',
  '🐈‍⬛',
  '🐓',
  '🦃',
  '🦤',
  '🦚',
  '🦜',
  '🦢',
  '🦩',
  '🕊',
  '🐇',
  '🦝',
  '🦨',
  '🦡',
  '🦫',
  '🦦',
  '🦥',
  '🐁',
  '🐀',
  '🐿',
  '🦔',
  '🐉',
  '🐲',
  '🌞',
  '🌝',
  '🌛',
  '🌜',
  '🌚',
  '⛄️',
  '⛷',
  '🏂',
  '🪂',
  '🏋️‍♀️',
  '🏋️',
  '🏋️‍♂️',
  '🤼‍♀️',
  '🤼',
  '🤼‍♂️',
  '🤸‍♀️',
  '🤸',
  '🤸‍♂️',
  '⛹️‍♀️',
  '⛹️',
  '⛹️‍♂️',
  '🤺',
  '🤾‍♀️',
  '🤾',
  '🤾‍♂️',
  '🏌️‍♀️',
  '🏌️',
  '🏌️‍♂️',
  '🏇',
  '🧘‍♀️',
  '🧘',
  '🧘‍♂️',
  '🏄‍♀️',
  '🏄',
  '🏄‍♂️',
  '🏊‍♀️',
  '🏊',
  '🏊‍♂️',
  '🤽‍♀️',
  '🤽',
  '🤽‍♂️',
  '🚣‍♀️',
  '🚣',
  '🚣‍♂️',
  '🧗‍♀️',
  '🧗',
  '🧗‍♂️',
  '🚵‍♀️',
  '🚵',
  '🚵‍♂️',
  '🚴‍♀️',
  '🚴',
  '🚴‍♂️',
  '🤹',
  '🤹‍♂️',
  '🤹‍♀️',
  '🗿',
  '🗽',
  '🧸',
  '🪆',
  '🎎',
]
const emojiCharacters = shuffle([...new Set(splitedEmojis)])
const gen = numberGen(emojiCharacters.length)

export const getEmojiCharacter = (): string => {
  const i = gen.next()
  return emojiCharacters[i.value]
}

export const nextEmojiCharacter = () => {
  thanksEmojiCharacters.value.push(currentEmojiCharacter.value)
  currentEmojiCharacter.value = getEmojiCharacter()
}
