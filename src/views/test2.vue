<template>
  <Button 
    text="测试按钮"
    type="warning"
    @click="handleClick"
    class="my-button"
    icon="mdi:magnify"
    iconSize="22px"
  />
</template>

<script setup>
import Button from '../components/Button/Button.vue'

const handleClick = () => {
  console.log('button clicked')
}
</script>

<style scoped lang="scss">

</style>