<!-- 虚拟表格（单表 + sticky 表头 + 占位行方案） -->
<template>
  <div
    ref="containerRef"
    class="virtual-table-infinite"
    :style="{ height: `${height}px` }"
    @scroll="handleScroll"
  >
    <table>
      <!-- colgroup 统一控制列宽，表头与表体自动对齐 -->
      <colgroup>
        <col
          v-for="col in columns"
          :key="col.key"
          :style="getColStyle(col)"
        />
      </colgroup>

      <!-- 表头：sticky 固定，随水平滚动但不随垂直滚动 -->
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key">
            {{ col.title }}
          </th>
        </tr>
      </thead>

      <tbody>
        <!-- 顶部占位行，撑开上方不可见区域 -->
        <tr v-if="topSpacerHeight > 0" class="spacer-row">
          <td :colspan="columns.length" :style="{ height: `${topSpacerHeight}px` }"></td>
        </tr>

        <!-- 可见行 -->
        <tr
          v-for="row in visibleRows"
          :key="getRowKey(row)"
          class="data-row"
        >
          <td v-for="col in columns" :key="col.key">
            <slot
              :name="`cell-${col.key}`"
              :row="row.data"
              :column="col"
              :index="row.index"
              :value="row.data[col.dataIndex]"
            >
              {{ row.data[col.dataIndex] }}
            </slot>
          </td>
        </tr>

        <!-- 底部占位行，撑开下方不可见区域 -->
        <tr v-if="bottomSpacerHeight > 0" class="spacer-row">
          <td :colspan="columns.length" :style="{ height: `${bottomSpacerHeight}px` }"></td>
        </tr>
      </tbody>
    </table>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 已加载全部 -->
    <div v-else-if="!hasMore && data.length > 0" class="end-indicator">
      没有更多了
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  rowHeight: {
    type: Number,
    default: 50,
  },
  rowKey: {
    type: [String, Function],
    default: 'id',
  },
  loadMore: {
    type: Function,
    default: null,
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
  threshold: {
    type: Number,
    default: 200,
  },
  overscan: {
    type: Number,
    default: 5,
  },
})

const emit = defineEmits(['update:loading'])

const containerRef = ref()
const scrollTop = ref(0)
const loading = ref(false)

function getRowKey(row) {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row.data)
  }
  return row.data[props.rowKey] ?? row.index
}

// col 的宽度样式，作用于 <col>，表头与表体自动共享
function getColStyle(col) {
  if (col.width) return { width: `${col.width}px` }
  if (col.minWidth) return { minWidth: `${col.minWidth}px` }
  return {}
}

// 可见行范围
const visibleRowRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.rowHeight)
  const end = Math.ceil((scrollTop.value + props.height) / props.rowHeight)
  return {
    start: Math.max(0, start - props.overscan),
    end: Math.min(props.data.length - 1, end + props.overscan),
  }
})

// 可见行数据
const visibleRows = computed(() => {
  const result = []
  for (let i = visibleRowRange.value.start; i <= visibleRowRange.value.end; i++) {
    result.push({ index: i, data: props.data[i] })
  }
  return result
})

// 顶部占位高度
const topSpacerHeight = computed(() => visibleRowRange.value.start * props.rowHeight)

// 底部占位高度
const bottomSpacerHeight = computed(() => {
  const remaining = props.data.length - 1 - visibleRowRange.value.end
  return Math.max(0, remaining * props.rowHeight)
})

let rafId = null
function handleScroll(e) {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    scrollTop.value = e.target.scrollTop
    checkLoadMore(e.target)
  })
}

function checkLoadMore(container) {
  if (!props.loadMore || loading.value || !props.hasMore) return
  const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight
  if (distanceToBottom < props.threshold) {
    loadMoreData()
  }
}

async function loadMoreData() {
  if (loading.value || !props.hasMore) return
  loading.value = true
  emit('update:loading', true)
  try {
    await props.loadMore()
  } catch (error) {
    console.error('加载失败', error)
  } finally {
    loading.value = false
    emit('update:loading', false)
  }
}

defineExpose({
  scrollToIndex: (index) => {
    if (containerRef.value) containerRef.value.scrollTop = index * props.rowHeight
  },
  scrollTo: (offset) => {
    if (containerRef.value) containerRef.value.scrollTop = offset
  },
  reset: () => {
    scrollTop.value = 0
    if (containerRef.value) containerRef.value.scrollTop = 0
  },
})
</script>

<style scoped>
.virtual-table-infinite {
  overflow: auto;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  background: #fafafa;
  border-bottom: 2px solid #d9d9d9;
  white-space: nowrap;
}

td {
  padding: 12px 16px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-row {
  border-bottom: 1px solid #f0f0f0;
}

.data-row:hover {
  background: #f5f5f5;
}

.spacer-row td {
  padding: 0;
  border: none;
}

.loading-indicator,
.end-indicator {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: white;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
