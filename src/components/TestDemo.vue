<template>
  <n-card>
    <n-button @click="handleClick">
      测试按钮
    </n-button>
  </n-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMessage } from 'naive-ui'

export default defineComponent({
  setup () {
    const message = useMessage()
    return {
      handleClick () {
        message.info('Button Clicked')
      }
    }
  }
})
</script>