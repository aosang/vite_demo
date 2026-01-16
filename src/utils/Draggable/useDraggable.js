// useDraggable.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useDraggable(options = {}) {
  const {
    onDragStart,
    onDragMove,
    onDragEnd,
    disabled = false,
    handle = null, // 拖拽手柄选择器
  } = options

  const elementRef = ref(null)
  const isDragging = ref(false)
  const dragData = ref(null)

  let startX = 0
  let startY = 0
  let currentX = 0
  let currentY = 0

  function handlePointerDown(e) {
    if (disabled) return

    // 如果指定了手柄,检查点击的是否是手柄
    if (handle && !e.target.closest(handle)) {
      return
    }

    e.preventDefault()

    // 记录起始位置
    startX = e.clientX
    startY = e.clientY
    currentX = 0
    currentY = 0

    isDragging.value = true

    // 设置指针捕获
    elementRef.value.setPointerCapture(e.pointerId)

    // 添加事件监听
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)

    // 触发回调
    dragData.value = onDragStart?.(e)
  }

  function handlePointerMove(e) {
    if (!isDragging.value) return

    currentX = e.clientX - startX
    currentY = e.clientY - startY

    onDragMove?.({
      x: currentX,
      y: currentY,
      clientX: e.clientX,
      clientY: e.clientY,
      event: e,
    })
  }

  function handlePointerUp(e) {
    if (!isDragging.value) return

    isDragging.value = false

    // 移除事件监听
    document.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('pointerup', handlePointerUp)

    // 触发回调
    onDragEnd?.({
      x: currentX,
      y: currentY,
      event: e,
      data: dragData.value,
    })

    dragData.value = null
  }

  onMounted(() => {
    if (elementRef.value) {
      elementRef.value.addEventListener('pointerdown', handlePointerDown)
    }
  })

  onUnmounted(() => {
    if (elementRef.value) {
      elementRef.value.removeEventListener('pointerdown', handlePointerDown)
    }
    document.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('pointerup', handlePointerUp)
  })

  return {
    elementRef,
    isDragging,
    dragData,
  }
}