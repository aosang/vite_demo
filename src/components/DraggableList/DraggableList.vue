<!-- components/DraggableList/DraggableList.vue -->
<template>
  <div ref="containerRef" class="draggable-list">
    <div
      v-for="(item, index) in localItems"
      :key="getItemKey(item)"
      :ref="el => setItemRef(el, index)"
      class="draggable-item"
      :class="{
        'is-dragging': draggingIndex === index,
        'is-placeholder': placeholderIndex === index
      }"
      :style="getItemStyle(index)"
      @pointerdown="handlePointerDown($event, index)"
    >
      <slot :item="item" :index="index"></slot>
    </div>

    <!-- 拖拽预览 -->
    <Teleport to="body">
      <div
        v-if="isDragging"
        class="drag-preview"
        :style="{
          transform: `translate(${previewX}px, ${previewY}px)`,
          width: previewWidth + 'px'
        }"
      >
        <slot name="preview" :item="draggingItem">
          <slot :item="draggingItem" :index="draggingIndex"></slot>
        </slot>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'


const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  itemKey: {
    type: [String, Function],
    default: 'id',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const containerRef = ref(null)
const localItems = ref([...props.modelValue])

watch(() => props.modelValue, (newVal) => {
  localItems.value = [...newVal]
}, { deep: true })

// 拖拽状态
const isDragging = ref(false)
const draggingIndex = ref(null)
const draggingItem = ref(null)
const placeholderIndex = ref(null)

// 预览位置
const previewX = ref(0)
const previewY = ref(0)
const previewWidth = ref(0)

// 元素引用
const itemRefs = new Map()

function setItemRef(el, index) {
  if (el) {
    itemRefs.set(index, el)
  }
}

// 获取项的 key
function getItemKey(item) {
  if (typeof props.itemKey === 'function') {
    return props.itemKey(item)
  }
  return item[props.itemKey]
}

// 获取项的样式
function getItemStyle(index) {
  if (draggingIndex.value === index) {
    return {
      opacity: 0.3,
      pointerEvents: 'none',
    }
  }
  return {}
}

// 开始拖拽
let startX = 0
let startY = 0
let startPageY = 0

function handlePointerDown(e, index) {
  if (props.disabled) return

  const element = itemRefs.get(index)
  if (!element) return

  // 记录起始位置
  const rect = element.getBoundingClientRect()
  startX = e.clientX - rect.left
  startY = e.clientY - rect.top
  startPageY = e.clientY

  draggingIndex.value = index
  draggingItem.value = localItems.value[index]
  placeholderIndex.value = index

  previewWidth.value = rect.width
  previewX.value = rect.left
  previewY.value = rect.top

  isDragging.value = true

  // 设置指针捕获
  element.setPointerCapture(e.pointerId)

  document.addEventListener('pointermove', handlePointerMove)
  document.addEventListener('pointerup', handlePointerUp)
}

// 拖拽中
function handlePointerMove(e) {
  if (!isDragging.value) return

  // 更新预览位置
  previewX.value = e.clientX - startX
  previewY.value = e.clientY - startY

  // 计算应该插入的位置
  const newIndex = findInsertIndex(e.clientY)
  if (newIndex !== placeholderIndex.value) {
    placeholderIndex.value = newIndex
  }
}

// 查找插入位置
function findInsertIndex(clientY) {
  const containerRect = containerRef.value.getBoundingClientRect()
  const relativeY = clientY - containerRect.top

  let insertIndex = 0

  for (let i = 0; i < localItems.value.length; i++) {
    if (i === draggingIndex.value) continue

    const element = itemRefs.get(i)
    if (!element) continue

    const rect = element.getBoundingClientRect()
    const elementY = rect.top - containerRect.top
    const elementMiddle = elementY + rect.height / 2

    if (relativeY < elementMiddle) {
      break
    }

    insertIndex = i + 1
  }

  return insertIndex
}

// 结束拖拽
function handlePointerUp(e) {
  if (!isDragging.value) return

  document.removeEventListener('pointermove', handlePointerMove)
  document.removeEventListener('pointerup', handlePointerUp)

  // 更新数组顺序
  if (placeholderIndex.value !== draggingIndex.value) {
    const newItems = [...localItems.value]
    const [removed] = newItems.splice(draggingIndex.value, 1)
    newItems.splice(placeholderIndex.value, 0, removed)

    localItems.value = newItems
    emit('update:modelValue', newItems)
    emit('change', {
      from: draggingIndex.value,
      to: placeholderIndex.value,
      item: removed,
    })
  }

  // 重置状态
  isDragging.value = false
  draggingIndex.value = null
  draggingItem.value = null
  placeholderIndex.value = null
}
</script>

<style scoped>
.draggable-list {
  position: relative;
}

.draggable-item {
  cursor: move;
  transition: opacity 0.2s;
  user-select: none;
}

.draggable-item.is-dragging {
  opacity: 0.3;
  pointer-events: none;
}

.drag-preview {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  opacity: 0.8;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>