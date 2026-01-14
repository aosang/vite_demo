<template>
  <canvas ref="canvas" class="canvas"></canvas>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const rect = canvas.value.getBoundingClientRect()
  
  // 关键：同步真实像素尺寸
  canvas.value.width = rect.width
  canvas.value.height = rect.height

  const ctx = canvas.value.getContext('2d')

  const w = canvas.value.width
  const h = canvas.value.height

  ctx.fillStyle = 'skyblue'
  ctx.beginPath()
  ctx.arc(w / 2, h / 2, 80, 0, Math.PI * 2)
  ctx.fill()
})
</script>

<style>
.canvas {
  width: 100vw;
  height: 100vh;
  display: block;
}
</style>
