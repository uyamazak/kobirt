<template>
  <div class="fukidashi">{{ message }}</div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'ToriFukidashi',
  props: {
    message: {
      type: String as PropType<string>,
      default: '',
    },
  },
})
</script>
<style lang="scss" scoped>
/* https://saruwakakun.com/html-css/reference/speech-bubble */
.fukidashi {
  @apply relative inline-block my-1em py-7px px-10px max-w-120px max-w-full leading-normal bg-white;
  color: #555;
  border: solid 2px #9a9899;
  border-radius: 10px;
}
.fukidashi:before {
  @apply absolute;
  content: '';
  bottom: -24px;
  left: 50%;
  margin-left: -16px;
  border: 12px solid transparent;
  border-top: 12px solid #fff;
  z-index: 2;
}

.fukidashi:after {
  @apply absolute;
  content: '';
  bottom: -30px;
  left: 50%;
  margin-left: -19px;
  border: 15px solid transparent;
  border-top: 15px solid #9a9899;
  z-index: 1;
}
</style>
