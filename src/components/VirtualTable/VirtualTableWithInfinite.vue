<!-- 虚拟表格 -->
<template>
  <div class="virtual-table-infinite" :style="{ height: `${height}px` }">
    <!-- 表头 -->
    <div
      class="virtual-table-header"
      :style="{ transform: `translateX(-${scrollLeft}px)` }"
    >
      <table>
        <thead>
          <tr>
            <th
              v-for="col in visibleColumns"
              :key="col.key"
              :style="{ width: col.width ? `${col.width}px` : 'auto', minWidth: col.minWidth ? `${col.minWidth}px` : 'auto' }"
            >
              {{ col.title }}
            </th>
          </tr>
        </thead>
      </table>
    </div>

    <!-- 表体 -->
    <div
      ref="bodyRef"
      class="virtual-table-body"
      @scroll="handleScroll"
    >
      <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
        <table>
          <tbody>
            <tr
              v-for="row in visibleRows"
              :key="getRowKey(row)"
              :style="{
                position: 'absolute',
                top: `${getRowOffset(row.index)}px`,
                width: '100%',
              }"
            >
              <td
                v-for="col in visibleColumns"
                :key="col.key"
                :style="{ width: col.width ? `${col.width}px` : 'auto', minWidth: col.minWidth ? `${col.minWidth}px` : 'auto' }"
              >
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
          </tbody>
        </table>
      </div>

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
  // 加载更多函数
  loadMore: {
    type: Function,
    default: null,
  },
  // 是否有更多数据
  hasMore: {
    type: Boolean,
    default: false,
  },
  // 距离底部多远触发加载 (px)
  threshold: {
    type: Number,
    default: 200,
  },
  // 缓冲区行数
  overscan: {
    type: Number,
    default: 5,
  },
})

const emit = defineEmits(['update:loading'])

const bodyRef = ref()
const scrollTop = ref(0)
const scrollLeft = ref(0)
const loading = ref(false)

// 获取行的 key
function getRowKey(row) {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row.data)
  }
  return row.data[props.rowKey] || row.index
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

// 可见行
const visibleRows = computed(() => {
  const result = []
  for (let i = visibleRowRange.value.start; i <= visibleRowRange.value.end; i++) {
    result.push({
      index: i,
      data: props.data[i],
    })
  }
  return result
})

// 可见列
const visibleColumns = computed(() => props.columns)

// 总高度
const totalHeight = computed(() => {
  return props.data.length * props.rowHeight
})

// 获取行偏移
function getRowOffset(index) {
  return index * props.rowHeight
}

// 处理滚动
let rafId = null
function handleScroll(e) {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }

  rafId = requestAnimationFrame(() => {
    scrollTop.value = e.target.scrollTop
    scrollLeft.value = e.target.scrollLeft

    // 检查是否需要加载更多
    checkLoadMore(e.target)
  })
}

// 检查是否需要加载更多
function checkLoadMore(container) {
  if (!props.loadMore || loading.value || !props.hasMore) return

  const scrollHeight = container.scrollHeight
  const scrollTop = container.scrollTop
  const clientHeight = container.clientHeight

  // 距离底部的距离
  const distanceToBottom = scrollHeight - scrollTop - clientHeight

  if (distanceToBottom < props.threshold) {
    loadMoreData()
  }
}

// 加载更多数据
async function loadMoreData() {
  if (loading.value || !props.hasMore) return

  loading.value = true
  emit('update:loading', false)

  try {
    await props.loadMore()
  } catch (error) {
    console.error('加载失败', error)
  } finally {
    loading.value = false
    emit('update:loading', false)
  }
}

// 暴露方法
defineExpose({
  scrollToIndex: (index) => {
    const offset = getRowOffset(index)
    bodyRef.value.scrollTop = offset
  },
  scrollTo: (offset) => {
    bodyRef.value.scrollTop = offset
  },
  reset: () => {
    scrollTop.value = 0
    if (bodyRef.value) {
      bodyRef.value.scrollTop = 0
    }
  },
})
</script>

<style scoped>
.virtual-table-infinite {
  overflow: hidden;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.virtual-table-header {
  overflow: hidden;
  background: #fafafa;
}

.virtual-table-body {
  height: calc(100% - 50px);
  overflow: auto;
  position: relative;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #d9d9d9;
  background: #fafafa;
}

td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

tr:hover td {
  background: #f5f5f5;
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
