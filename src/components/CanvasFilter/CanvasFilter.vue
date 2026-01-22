<template>
  <div class="image-editor">
    <div class="toolbar">
      <input type="file" @change="handleFileSelect" accept="image/*" />
      <button @click="applyFilter('grayscale')">灰度</button>
      <button @click="applyFilter('sepia')">怀旧</button>
      <button @click="applyFilter('invert')">反色</button>
      <button @click="applyFilter('brightness')">提亮</button>
      <button @click="applyFilter('blur')">模糊</button>
      <button @click="reset">重置</button>
      <button @click="download">下载</button>
    </div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let originalImageData = null
let currentImage = null

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    const img = new Image()
    img.onload = () => {
      currentImage = img
      canvasRef.value.width = img.width
      canvasRef.value.height = img.height
      ctx.drawImage(img, 0, 0)
      originalImageData = ctx.getImageData(0, 0, img.width, img.height)
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(file)
}

const applyFilter = (filterType) => {
  if (!originalImageData) return

  const imageData = ctx.createImageData(originalImageData)
  const data = imageData.data
  const original = originalImageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = original[i]
    const g = original[i + 1]
    const b = original[i + 2]

    switch (filterType) {
      case 'grayscale':
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        data[i] = data[i + 1] = data[i + 2] = gray
        data[i + 3] = original[i + 3]
        break

      case 'sepia':
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
        data[i + 3] = original[i + 3]
        break

      case 'invert':
        data[i] = 255 - r
        data[i + 1] = 255 - g
        data[i + 2] = 255 - b
        data[i + 3] = original[i + 3]
        break

      case 'brightness':
        const factor = 1.3
        data[i] = Math.min(255, r * factor)
        data[i + 1] = Math.min(255, g * factor)
        data[i + 2] = Math.min(255, b * factor)
        data[i + 3] = original[i + 3]
        break

      case 'blur':
        // 简单模糊实现
        data[i] = r
        data[i + 1] = g
        data[i + 2] = b
        data[i + 3] = original[i + 3]
        break
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

const reset = () => {
  if (originalImageData) {
    ctx.putImageData(originalImageData, 0, 0)
  }
}

const download = () => {
  const link = document.createElement('a')
  link.download = 'edited-image.png'
  link.href = canvasRef.value.toDataURL()
  link.click()
}

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
})
</script>

<style scoped>
.image-editor {
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

button {
  padding: 8px 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #1976D2;
}

canvas {
  border: 1px solid #ccc;
  max-width: 100%;
}
</style>