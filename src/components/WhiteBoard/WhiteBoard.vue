<template>
  <div class="whiteboard">
    <div class="toolbar">
      <button @click="setTool('pen')" :class="{ active: tool === 'pen' }">画笔</button>
      <button @click="setTool('eraser')" :class="{ active: tool === 'eraser' }">橡皮</button>
      <button @click="setTool('text')" :class="{ active: tool === 'text' }">文字</button>
      
      <template v-if="tool === 'pen'">
        <input type="color" v-model="color" />
        <span class="tool-label">画笔粗细: {{ lineWidth }}px</span>
        <input
          type="range" 
          min="1" 
          max="20" 
          v-model.number="lineWidth"
        />
      </template>
      
      <template v-if="tool === 'eraser'">
        <span class="tool-label">橡皮大小: {{ eraserSize }}px</span>
        <input 
          type="range" 
          min="15" 
          max="80" 
          v-model.number="eraserSize"
          @input="handleEraserSizeChange"
        />
      </template>
      
      <template v-if="tool === 'text'">
        <input type="color" v-model="color" />
        <span class="tool-label">字体大小: {{ fontSize }}px</span>
        <input
          type="range" 
          min="12" 
          max="72" 
          v-model.number="fontSize"
        />
      </template>
      
      <button @click="clear">清空</button>
      <button @click="undo">撤销</button>
    </div>
    <div class="canvas-container">
      <canvas 
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        :class="canvasClass"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
        @mouseenter="handleMouseEnter"
      >
      </canvas>
      <!-- 橡皮预览圆圈 -->
      <div 
        v-if="tool === 'eraser' && showEraserPreview"
        class="eraser-preview"
        :style="{
          left: eraserPreviewPos.x + 'px',
          top: eraserPreviewPos.y + 'px',
          width: eraserSize + 'px',
          height: eraserSize + 'px'
        }"
      >
      </div>
      
      <!-- 文字输入框 -->
      <input
        v-if="showTextInput"
        ref="textInputRef"
        v-model="textInputValue"
        type="text"
        class="text-input"
        :style="{
          left: textInputPos.x + 'px',
          top: textInputPos.y + 'px',
          color: color,
          fontSize: fontSize + 'px'
        }"
        @keydown.enter="handleTextEnter"
        @blur="handleTextBlur"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const canvasWidth = ref(1200)
const canvasHeight = ref(800)

const tool = ref('pen')
const color = ref('#000000')
const lineWidth = ref(4)
const eraserSize = ref(30) // 橡皮默认尺寸
const fontSize = ref(24) // 文字默认大小

// 文字输入相关
const showTextInput = ref(false)
const textInputValue = ref('')
const textInputPos = ref({ x: 0, y: 0 })
const textInputRef = ref(null)
let isConfirmingText = false // 防止重复确认

// 根据工具类型设置不同的光标样式
const canvasClass = computed(() => {
  return `cursor-${tool.value}`
})

let ctx = null
let isDrawing = false
let lastX = 0
let lastY = 0
let strokes = []
let currentStroke = null

// 橡皮预览
const showEraserPreview = ref(false)
const eraserPreviewPos = ref({ x: 0, y: 0 })

// 笔画类
class Stroke {
  constructor(tool, color, lineWidth) {
    this.id = Date.now() + Math.random()
    this.tool = tool
    this.color = color
    this.lineWidth = lineWidth
    this.points = []
  }

  addPoint(x, y) {
    this.points.push({ x, y })
  }

  draw(ctx) {
    if (this.points.length < 2) return
    ctx.save()
    ctx.strokeStyle = this.color
    ctx.lineWidth = this.lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(this.points[0].x, this.points[0].y)

    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y)
    }

    ctx.stroke()
    ctx.restore()
  }
}

// 文字类
class TextItem {
  constructor(text, x, y, color, fontSize) {
    this.id = Date.now() + Math.random()
    this.tool = 'text'
    this.text = text
    this.x = x
    this.y = y
    this.color = color
    this.fontSize = fontSize
  }

  draw(ctx) {
    ctx.save()
    ctx.fillStyle = this.color
    ctx.font = `${this.fontSize}px Arial, sans-serif`
    ctx.textBaseline = 'top'
    ctx.fillText(this.text, this.x, this.y)
    ctx.restore()
  }
}

const setTool = (newTool) => {
  tool.value = newTool
  // 切换到橡皮时隐藏预览，需要鼠标移动才显示
  if (newTool !== 'eraser') {
    showEraserPreview.value = false
  }
}

// 调试：橡皮大小变化时的处理
const handleEraserSizeChange = (e) => {
  eraserSize.value = Number(e.target.value)
  console.log('橡皮大小已更改为:', eraserSize.value)
}

const getMousePos = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

const handleMouseDown = (e) => {
  // 如果正在输入文字，先保存当前文字
  if (showTextInput.value) {
    const currentText = textInputValue.value.trim()
    if (currentText) {
      // 立即保存文字，不等待 blur 事件
      const textItem = new TextItem(
        currentText,
        textInputPos.value.x,
        textInputPos.value.y,
        color.value,
        fontSize.value
      )
      strokes.push(textItem)
      textItem.draw(ctx)
      // console.log('保存了之前的文字:', currentText)
    }
    // 隐藏输入框
    showTextInput.value = false
    textInputValue.value = ''
    isConfirmingText = false
    
    // 如果是文字工具，继续处理新的点击
    if (tool.value === 'text') {
      const pos = getMousePos(e)
      // 延迟一下再显示新输入框
      setTimeout(() => {
        showTextInput.value = true
        textInputValue.value = ''
        textInputPos.value = pos
        setTimeout(() => {
          textInputRef.value?.focus()
        }, 0)
      }, 50)
      return
    }
    
    // 如果切换了工具，就不再显示输入框
    return
  }
  
  let pos = getMousePos(e)
  
  // 文字工具：显示输入框
  if (tool.value === 'text') {
    showTextInput.value = true
    textInputValue.value = ''
    textInputPos.value = pos
    // 等待 DOM 更新后聚焦输入框
    setTimeout(() => {
      textInputRef.value?.focus()
    }, 0)
    return
  }
  
  isDrawing = true
  lastX = pos.x
  lastY = pos.y

  // 橡皮擦不记录笔画，只有画笔才记录
  if (tool.value !== 'eraser') {
    currentStroke = new Stroke(tool.value, color.value, lineWidth.value)
    currentStroke.addPoint(pos.x, pos.y)
  } else {
    currentStroke = null
  }
}

const handleMouseMove = (e) => {
  const pos = getMousePos(e)
  
  // 更新橡皮预览位置
  if (tool.value === 'eraser') {
    const rect = canvasRef.value.getBoundingClientRect()
    showEraserPreview.value = true
    eraserPreviewPos.value = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }
  
  if (!isDrawing) return

  if (tool.value === 'eraser') {
    // 橡皮擦除逻辑：使用 destination-out 模式真正擦除
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    // 确保 eraserSize 是数字类型
    const size = Number(eraserSize.value)
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    // console.log('擦除中，橡皮大小:', size) // 调试信息
    
    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    
    ctx.restore()
  } else {
    // 绘制当前笔画
    ctx.strokeStyle = color.value
    ctx.lineWidth = Number(lineWidth.value)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

    currentStroke.addPoint(pos.x, pos.y)
  }

  lastX = pos.x
  lastY = pos.y
}

const handleMouseEnter = (e) => {
  if (tool.value === 'eraser') {
    const pos = getMousePos(e)
    showEraserPreview.value = true
    eraserPreviewPos.value = pos
  }
}

const handleMouseLeave = () => {
  handleMouseUp()
  showEraserPreview.value = false
}

const handleMouseUp = () => {
  if (isDrawing && currentStroke && currentStroke.points.length > 0) {
    strokes.push(currentStroke)
    currentStroke = null
  }
  isDrawing = false
}

// 处理文字输入的 Enter 键
const handleTextEnter = (e) => {
  e.preventDefault()
  confirmText()
}

// 处理文字输入框失焦
const handleTextBlur = () => {
  // 如果输入框还在显示，说明是真正的失焦（不是通过点击画布）
  // 延迟执行，避免与 Enter 事件冲突
  setTimeout(() => {
    // 检查输入框是否还在显示
    if (showTextInput.value) {
      confirmText()
    }
  }, 50)
}

// 确认文字输入
const confirmText = () => {
  // 防止重复调用
  if (isConfirmingText) return
  isConfirmingText = true
  
  const text = textInputValue.value.trim()
  // console.log('确认文字:', text) // 调试信息
  
  if (text) {
    const textItem = new TextItem(
      text,
      textInputPos.value.x,
      textInputPos.value.y,
      color.value,
      fontSize.value
    )
    strokes.push(textItem)
    // console.log('文字已添加到 strokes，当前 strokes 数量:', strokes.length) // 调试信息
    
    // 立即绘制文字到画布
    textItem.draw(ctx)
  }
  
  showTextInput.value = false
  textInputValue.value = ''
  isConfirmingText = false
}

const clear = () => {
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  strokes = []
}

const undo = () => {
  if (strokes.length > 0) {
    strokes.pop()
    redraw()
  }
}

const redraw = () => {
  // 清空画布并重新绘制白色背景
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 重新绘制所有笔画
  strokes.forEach(stroke => stroke.draw(ctx))
}

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
})
</script>

<style scoped>
.whiteboard {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
}

button {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

input[type="color"] {
  width: 50px;
  height: 38px;
  border: none;
  cursor: pointer;
}

input[type="range"] {
  width: 150px;
}

.tool-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.canvas-container {
  border: 1px solid #ccc;
  display: inline-block;
  line-height: 0;
  position: relative;
}

/* 橡皮预览圆圈 */
.eraser-preview {
  position: absolute;
  border: 2px solid rgba(255, 0, 0, 0.5);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.1);
}

canvas {
  background: white;
  display: block;
}

/* 画笔光标 - 十字形 */
canvas.cursor-pen {
  cursor: crosshair;
}

/* 橡皮光标 - 隐藏系统光标，使用自定义预览圆圈 */
canvas.cursor-eraser {
  cursor: none;
}

/* 文字工具光标 */
canvas.cursor-text {
  cursor: text;
}

/* 文字输入框 */
.text-input {
  position: absolute;
  border: 2px solid #2196F3;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  outline: none;
  font-family: Arial, sans-serif;
  min-width: 100px;
  transform: translateY(-50%);
}

button.active {
  background: #2196F3;
  color: white;
}

button:hover {
  background: #e0e0e0;
}

button.active:hover {
  background: #1976D2;
}
</style>