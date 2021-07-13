<template>
  <div class="flex">
    <div class="emoji-character">{{ emojiCharacter }}</div>
    <div class="text-sync"><slot></slot></div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'Questioner',
  props: {
    emojiCharacter: {
      type: String as PropType<string>,
      default: '',
    },
  },
})
</script>
<style lang="scss" scoped>
/* https://saruwakakun.com/html-css/reference/speech-bubble */
.emoji-character {
  @apply text-5xl p-10px lg:(text-8xl px-[0.5em]);
}
</style>
