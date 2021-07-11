<template>
  <ul class="sub-menu text-sync">
    <li>
      <button class="text-xl lg:(text-3xl)" @click="$emit('change-map-tile')">
        🗾
      </button>
    </li>
    <li>
      <button class="text-xl lg:(text-3xl)" @click="togglePrefecture">🥷</button>
    </li>
    <li>
      <a href="https://github.com/uyamazak/kobirt" target="_blank">
        <img
          class="opacity-90 mr-8px max-w-16px lg:(max-w-32px) inline-block"
          alt="github"
          src="/img/github.png"
        />
      </a>
    </li>
    <li>
      <span><small>せいかい:</small> {{ corrected }}</span>
    </li>
    <li>
      <span><small>のこり:</small> {{ remain }}</span>
    </li>
  </ul>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { togglePrefecture } from '../map-logics'

export default defineComponent({
  name: 'SubMenu',
  props: {
    corrected: {
      type: Number as PropType<number>,
      required: true,
    },
    remain: {
      type: Number as PropType<number>,
      required: true,
    },
  },
  emits: ['change-map-tile'],
  setup() {
    return {
      togglePrefecture,
    }
  },
})
</script>

<style lang="scss" scoped>
.sub-menu {
  @apply fixed bottom-0 z-2000 left-8px p-5px text-center lg:(w-full text-center);
  li {
    @apply inline-block mr-5px align-middle lg:(mr-20px);
  }
}
</style>
