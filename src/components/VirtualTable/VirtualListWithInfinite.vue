<!-- 无限滚动 -->
<template>
  <div ref="containerRef" class="virtual-list-infinite" :style="{ height: `${height}px`, overflow: 'auto' }"
    @scroll="handleScroll">
    <!-- 占位元素,撑起总高度 -->
    <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
      <!-- 可见元素 -->
      <div v-for="item in visibleItems" :key="getItemKey(item)" :ref="el => setItemRef(el, item)" :style="{
        position: 'absolute',
        top: `${getItemOffset(item.index)}px`,
        width: '100%',
      }">
        <slot :item="item.data" :index="item.index"></slot>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 已加载全部 -->
    <div v-else-if="!hasMore && items.length > 0" class="end-indicator">
      没有更多了
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // 数据列表
  items: {
    type: Array,
    required: true,
  },
  // 容器高度
  height: {
    type: Number,
    required: true,
  },
  // 预估每项高度
  estimatedItemHeight: {
    type: Number,
    default: 50,
  },
  // 缓冲区项数
  overscan: {
    type: Number,
    default: 5,
  },
  // 获取项的唯一 key
  itemKey: {
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
})

const emit = defineEmits(['update:loading'])

const containerRef = ref()
const scrollTop = ref(0)
const loading = ref(false)

// 高度缓存
const heightCache = new Map()

// 累计高度缓存
const offsetCache = ref([0])

// 元素引用 Map
const itemRefs = new Map()

// 元素索引映射（用于 ResizeObserver 回调）
const elementIndexMap = new WeakMap()

// 总高度
const totalHeight = computed(() => {
  return getItemOffset(props.items.length)
})

// 可见区域的起始和结束索引
const visibleRange = computed(() => {
  const start = findStartIndex(scrollTop.value)
  const end = findEndIndex(scrollTop.value + props.height, start)

  return {
    start: Math.max(0, start - props.overscan),
    end: Math.min(props.items.length - 1, end + props.overscan),
  }
})

// 可见的元素
const visibleItems = computed(() => {
  const result = []
  for (let i = visibleRange.value.start; i <= visibleRange.value.end; i++) {
    result.push({
      index: i,
      data: props.items[i],
    })
  }
  return result
})

// 获取项的 key
function getItemKey(item) {
  if (typeof props.itemKey === 'function') {
    return props.itemKey(item.data)
  }
  return item.data[props.itemKey] || item.index
}

// 获取项的高度
function getItemHeight(index) {
  return heightCache.get(index) || props.estimatedItemHeight
}

// 获取项的偏移量
function getItemOffset(index) {
  if (offsetCache.value[index] !== undefined) {
    return offsetCache.value[index]
  }

  // 计算并缓存
  let offset = offsetCache.value[offsetCache.value.length - 1] || 0
  for (let i = offsetCache.value.length; i <= index; i++) {
    offset += getItemHeight(i - 1)
    offsetCache.value[i] = offset
  }

  return offsetCache.value[index]
}

// 二分查找起始索引
function findStartIndex(scrollTop) {
  let left = 0
  let right = props.items.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const offset = getItemOffset(mid)

    if (offset === scrollTop) {
      return mid
    } else if (offset < scrollTop) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return Math.max(0, right)
}

// 查找结束索引
function findEndIndex(bottom, start) {
  let offset = getItemOffset(start)

  for (let i = start; i < props.items.length; i++) {
    offset += getItemHeight(i)
    if (offset >= bottom) {
      return i
    }
  }

  return props.items.length - 1
}

// 设置元素引用
function setItemRef(el, item) {
  if (el) {
    const oldEl = itemRefs.get(item.index)
    // 如果元素已存在且不同，先取消观察旧元素
    if (oldEl && oldEl !== el) {
      resizeObserver.unobserve(oldEl)
    }
    
    itemRefs.set(item.index, el)
    // 测量高度
    measureItemHeight(el, item.index)
  } else {
    // 元素被移除，取消观察
    const oldEl = itemRefs.get(item.index)
    if (oldEl) {
      resizeObserver.unobserve(oldEl)
      itemRefs.delete(item.index)
    }
  }
}

// 测量元素高度
const resizeObserver = new ResizeObserver((entries) => {
  entries.forEach(entry => {
    const index = elementIndexMap.get(entry.target)
    if (index !== undefined) {
      updateItemHeight(index, entry.contentRect.height)
    }
  })
})

function measureItemHeight(el, index) {
  // 使用 WeakMap 存储索引，避免元素重用时的索引错误
  elementIndexMap.set(el, index)

  // 观察元素大小变化
  resizeObserver.observe(el)

  // 立即测量一次
  requestAnimationFrame(() => {
    const height = el.offsetHeight
    if (height > 0) {
      updateItemHeight(index, height)
    }
  })
}

// 更新元素高度
function updateItemHeight(index, height) {
  const oldHeight = getItemHeight(index)

  if (Math.abs(oldHeight - height) < 1) return // 忽略小于 1px 的差异

  // 更新缓存
  heightCache.set(index, height)

  // 清空该索引之后的偏移量缓存，强制重新计算
  if (offsetCache.value.length > index + 1) {
    offsetCache.value.length = index + 1
  }
}

// 处理滚动
let rafId = null
function handleScroll(e) {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }

  rafId = requestAnimationFrame(() => {
    scrollTop.value = e.target.scrollTop
    
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

// 监听数据变化，重置缓存
watch(() => props.items.length, (newLen, oldLen) => {
  // 如果数据减少，清理缓存
  if (newLen < oldLen) {
    // 清理超出范围的高度缓存
    for (let i = newLen; i < oldLen; i++) {
      heightCache.delete(i)
    }
    // 重置偏移量缓存
    if (offsetCache.value.length > newLen + 1) {
      offsetCache.value.length = newLen + 1
    }
  }
})

// 清理
onUnmounted(() => {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
  resizeObserver.disconnect()
})

// 暴露方法
defineExpose({
  scrollToIndex: (index) => {
    const offset = getItemOffset(index)
    containerRef.value.scrollTop = offset
  },
  scrollTo: (offset) => {
    containerRef.value.scrollTop = offset
  },
  reset: () => {
    heightCache.clear()
    offsetCache.value = [0]
    scrollTop.value = 0
    if (containerRef.value) {
      containerRef.value.scrollTop = 0
    }
  },
})
</script>

<style scoped>
.virtual-list-infinite {
  position: relative;
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
