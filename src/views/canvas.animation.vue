<template>
  <div class="canvas-container">
    <div class="controls">
      <button @click="toggleAnimation" :class="{ active: isRunning }">
        {{ isRunning ? '暂停动画' : '开始动画' }}
      </button>
      <button @click="addRandomSprite">添加随机精灵</button>
      <button @click="clearAllSprites">清空精灵</button>
      <span class="fps">FPS: {{ fps }}</span>
      <span class="count">精灵数量: {{ sprites.length }}</span>
    </div>
    
    <canvas 
      ref="canvasRef" 
      width="800" 
      height="600"
      @click="handleCanvasClick"
      class="canvas"
    ></canvas>
    
    <div class="tips">
      💡 提示：点击画布添加精灵，精灵会自动移动并在边界反弹
    </div>
  </div>
</template>

<script setup>
import { useCanvasAnimation } from '../utils/CanvasAnimation/CanvasAnimation.js'
import { ref, onMounted } from 'vue'

const canvasRef = ref(null)

// 使用动画系统
const {
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
} = useCanvasAnimation(canvasRef)

// 生成随机颜色
const randomColor = () => {
  const colors = ['#2196F3', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4']
  return colors[Math.floor(Math.random() * colors.length)]
}

// 创建一个带边界检测的精灵类
class BouncingSprite extends Sprite {
  constructor(x, y) {
    super(x, y)
    this.vx = (Math.random() - 0.5) * 10
    this.vy = (Math.random() - 0.5) * 10
    this.color = randomColor()
  }

  update(deltaTime) {
    super.update(deltaTime)
    
    // 边界检测和反弹
    if (this.x <= 0 || this.x + this.width >= 800) {
      this.vx = -this.vx
      this.x = Math.max(0, Math.min(this.x, 800 - this.width))
    }
    if (this.y <= 0 || this.y + this.height >= 600) {
      this.vy = -this.vy
      this.y = Math.max(0, Math.min(this.y, 600 - this.height))
    }
  }

  draw(ctx) {
    if (!this.visible) return
    
    // 绘制带阴影的矩形
    ctx.save()
    ctx.shadowBlur = 10
    ctx.shadowColor = this.color
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)
    
    // 绘制边框
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.strokeRect(this.x, this.y, this.width, this.height)
    ctx.restore()
  }
}

// 添加随机精灵
const addRandomSprite = () => {
  const x = Math.random() * (800 - 50)
  const y = Math.random() * (600 - 50)
  const sprite = new BouncingSprite(x, y)
  addSprite(sprite)
  
  // 如果动画未运行，自动开始
  if (!isRunning.value) {
    start()
  }
}

// 处理画布点击
const handleCanvasClick = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  // 检查是否点击了精灵
  const clickedSprite = findSpriteAt(x, y)
  
  if (clickedSprite) {
    // 点击到精灵，移除它
    removeSprite(clickedSprite)
  } else {
    // 点击空白处，添加新精灵
    const sprite = new BouncingSprite(x - 25, y - 25)
    addSprite(sprite)
    
    // 如果动画未运行，自动开始
    if (!isRunning.value) {
      start()
    }
  }
}

// 切换动画状态
const toggleAnimation = () => {
  if (isRunning.value) {
    stop()
  } else {
    start()
  }
}

// 清空所有精灵
const clearAllSprites = () => {
  clearSprites()
}

// 初始化：添加几个精灵并开始动画
onMounted(() => {
  // 添加初始精灵
  for (let i = 0; i < 5; i++) {
    addRandomSprite()
  }
  
  // 开始动画
  start()
})
</script>

<style scoped>
.canvas-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 20px;
}

.controls {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #2196F3;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

button:hover {
  background: #1976D2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

button:active {
  transform: translateY(0);
}

button.active {
  background: #4CAF50;
}

button.active:hover {
  background: #388E3C;
}

.fps, .count {
  padding: 8px 16px;
  background: white;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.canvas {
  border: 3px solid #e0e0e0;
  border-radius: 8px;
  background: #000;
  cursor: crosshair;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: border-color 0.3s ease;
}

.canvas:hover {
  border-color: #2196F3;
}

.tips {
  padding: 12px 20px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  color: #856404;
  font-size: 14px;
}
</style>