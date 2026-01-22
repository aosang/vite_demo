// composables/useCanvasAnimation.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useCanvasAnimation(canvasRef) {
  const isRunning = ref(false)
  const fps = ref(60)

  let animationId = null
  let lastTime = 0
  let sprites = []

  // 精灵基类
  class Sprite {
    constructor(x, y) {
      this.x = x
      this.y = y
      this.vx = 0
      this.vy = 0
      this.width = 50
      this.height = 50
      this.color = '#2196F3'
      this.visible = true
    }

    update(deltaTime) {
      this.x += this.vx * deltaTime / 16
      this.y += this.vy * deltaTime / 16
    }

    draw(ctx) {
      if (!this.visible) return
      ctx.fillStyle = this.color
      ctx.fillRect(this.x, this.y, this.width, this.height)
    }

    contains(x, y) {
      return x >= this.x && x <= this.x + this.width &&
        y >= this.y && y <= this.y + this.height
    }
  }

  // 添加精灵
  const addSprite = (sprite) => {
    sprites.push(sprite)
    return sprite
  }

  // 移除精灵
  const removeSprite = (sprite) => {
    const index = sprites.indexOf(sprite)
    if (index > -1) {
      sprites.splice(index, 1)
    }
  }

  // 清空所有精灵
  const clearSprites = () => {
    sprites = []
  }

  // 动画循环
  const animate = (timestamp) => {
    if (!isRunning.value) return

    const deltaTime = timestamp - lastTime
    lastTime = timestamp

    // 计算FPS
    fps.value = Math.round(1000 / deltaTime)

    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 更新和绘制所有精灵
    sprites.forEach(sprite => {
      sprite.update(deltaTime)
      sprite.draw(ctx)
    })

    animationId = requestAnimationFrame(animate)
  }

  // 开始动画
  const start = () => {
    if (isRunning.value) return
    isRunning.value = true
    lastTime = performance.now()
    animationId = requestAnimationFrame(animate)
  }

  // 停止动画
  const stop = () => {
    isRunning.value = false
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  // 查找点击的精灵
  const findSpriteAt = (x, y) => {
    for (let i = sprites.length - 1; i >= 0; i--) {
      if (sprites[i].contains(x, y)) {
        return sprites[i]
      }
    }
    return null
  }

  onUnmounted(() => {
    stop()
  })

  return {
    Sprite,
    sprites,
    isRunning,
    fps,
    addSprite,
    removeSprite,
    clearSprites,
    start,
    stop,
    findSpriteAt
  }
}