<!-- 看板 -->
<template>
  <div class="kanban-board">
    <div class="kanban-columns">
      <div
        v-for="column in columns"
        :key="column.id"
        class="kanban-column"
      >
        <div class="column-header">
          <h3>{{ column.name }}</h3>
          <span class="card-count">{{ column.cards.length }}</span>
        </div>

        <div
          :ref="el => setColumnRef(el, column.id)"
          class="column-body"
          :class="{ 'is-over': overColumnId === column.id }"
          @dragover="handleDragOver($event, column.id)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, column.id)"
        >
          <div
            v-for="(card, index) in column.cards"
            :key="card.id"
            class="kanban-card"
            draggable="true"
            @dragstart="handleDragStart($event, column.id, index, card)"
            @dragend="handleDragEnd"
          >
            <slot name="card" :card="card">
              <div class="card-title">{{ card.title }}</div>
            </slot>
          </div>

          <!-- 插入指示器 -->
          <div
            v-if="overColumnId === column.id && insertIndex !== null"
            class="insert-indicator"
            :style="{ top: insertIndicatorTop + 'px' }"
          ></div>

          <!-- 空状态 -->
          <div v-if="column.cards.length === 0" class="column-empty">
            拖拽卡片到这里
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'


const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['card-move'])

// 列元素引用
const columnRefs = new Map()

function setColumnRef(el, columnId) {
  if (el) {
    columnRefs.set(columnId, el)
  }
}

// 拖拽状态
const dragState = reactive({
  sourceColumnId: null,
  sourceIndex: null,
  dragData: null,
})

const overColumnId = ref(null)
const insertIndex = ref(null)
const insertIndicatorTop = ref(0)

// 开始拖拽
function handleDragStart(e, columnId, index, card) {
  dragState.sourceColumnId = columnId
  dragState.sourceIndex = index
  dragState.dragData = card

  // 设置拖拽数据
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', card.id)

  // 自定义拖拽图像(可选)
  const dragImage = e.target.cloneNode(true)
  dragImage.style.opacity = '0.8'
  document.body.appendChild(dragImage)
  e.dataTransfer.setDragImage(dragImage, 0, 0)
  setTimeout(() => document.body.removeChild(dragImage), 0)
}

// 拖拽经过
function handleDragOver(e, columnId) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'

  overColumnId.value = columnId

  // 计算插入位置
  const columnEl = columnRefs.get(columnId)
  if (!columnEl) return

  const cards = Array.from(columnEl.querySelectorAll('.kanban-card'))
  const afterElement = getDragAfterElement(columnEl, e.clientY, cards)

  if (afterElement == null) {
    insertIndex.value = cards.length
    insertIndicatorTop.value = columnEl.scrollHeight
  } else {
    const rect = afterElement.getBoundingClientRect()
    const containerRect = columnEl.getBoundingClientRect()
    insertIndex.value = cards.indexOf(afterElement)
    insertIndicatorTop.value = rect.top - containerRect.top
  }
}

// 找到拖拽后面的元素
function getDragAfterElement(container, y, cards) {
  return cards.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 2

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}

// 离开拖拽区域
function handleDragLeave(e) {
  // 检查是否真的离开了列(而不是进入子元素)
  if (e.currentTarget.contains(e.relatedTarget)) {
    return
  }

  if (overColumnId.value) {
    overColumnId.value = null
    insertIndex.value = null
  }
}

// 放置
function handleDrop(e, targetColumnId) {
  e.preventDefault()

  const { sourceColumnId, sourceIndex, dragData } = dragState

  if (!sourceColumnId || !dragData) return

  // 触发移动事件
  emit('card-move', {
    card: dragData,
    fromColumn: sourceColumnId,
    fromIndex: sourceIndex,
    toColumn: targetColumnId,
    toIndex: insertIndex.value,
  })

  // 重置状态
  overColumnId.value = null
  insertIndex.value = null
}

// 结束拖拽
function handleDragEnd() {
  dragState.sourceColumnId = null
  dragState.sourceIndex = null
  dragState.dragData = null
  overColumnId.value = null
  insertIndex.value = null
}
</script>

<style scoped>
.kanban-board {
  height: 100%;
  overflow-x: auto;
}

.kanban-columns {
  display: flex;
  gap: 16px;
  padding: 16px;
  height: 100%;
}

.kanban-column {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  border-radius: 4px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.column-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.card-count {
  color: #999;
  font-size: 14px;
}

.column-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  position: relative;
  min-height: 100px;
}

.column-body.is-over {
  background: #e8f4fd;
}

.kanban-card {
  background: white;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: move;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.kanban-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.card-title {
  font-size: 14px;
  line-height: 1.5;
}

.insert-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #1890ff;
  pointer-events: none;
  transition: top 0.2s;
}

.column-empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}
</style>