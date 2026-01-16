<!-- components/VirtualList/VirtualList.vue -->
<template>
  <div ref="containerRef" class="virtual-list" :style="{ height: `${height}px`, overflow: 'auto' }"
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
})

const containerRef = ref()

// 滚动位置
const scrollTop = ref(0)

// 高度缓存
const heightCache = new Map()

// 累计高度缓存
const offsetCache = ref([0])

// 元素引用 Map
const itemRefs = new Map()

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

// 元素索引映射（用于 ResizeObserver 回调）
const elementIndexMap = new WeakMap()

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
  // 这样可以避免累计误差
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
  })
}

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
})
</script>

<style scoped>
.virtual-list {
  position: relative;
}
</style>