<!-- BaseChart.vue -->
<template>
  <div class="base-chart-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="chart-loading">
      <div class="loading-spinner"></div>
      <p>图表加载中...</p>
    </div>
    
    <!-- 空数据状态 -->
    <div v-else-if="isEmpty" class="chart-empty">
      <div class="empty-icon">📊</div>
      <p>{{ emptyText }}</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="chart-error">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="handleRetry">重试</button>
    </div>
    
    <!-- 图表容器 -->
    <div
      v-else
      ref="chartRef"
      class="chart-wrapper"
      :style="{ height: height, width: width }"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, shallowRef } from 'vue'
import * as echarts from 'echarts'
import { debounce, merge } from 'lodash-es'
import { useTheme } from '@/utils/chartConfig/useTheme'
import { getDefaultOptions } from '@/utils/chartConfig/chartConfig'

const props = defineProps({
  // 图表类型
  type: {
    type: String,
    required: true,
    validator: (value) => ['line', 'bar', 'pie', 'scatter', 'radar'].includes(value)
  },
  // 图表数据
  data: {
    type: [Array, Object],
    default: () => []
  },
  // 自定义配置
  options: {
    type: Object,
    default: () => ({})
  },
  // 图表高度
  height: {
    type: String,
    default: '400px'
  },
  // 图表宽度
  width: {
    type: String,
    default: '100%'
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 空数据提示
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  // 是否自动响应式
  responsive: {
    type: Boolean,
    default: true
  },
  // 主题
  theme: {
    type: String,
    default: 'default'
  },
  // 是否显示工具栏
  showToolbox: {
    type: Boolean,
    default: false
  },
  // 自动刷新间隔（毫秒）
  autoRefresh: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['click', 'ready', 'error', 'refresh'])

// 图表实例（使用 shallowRef 避免深度响应）
const chartInstance = shallowRef(null)
// 图表容器引用
const chartRef = ref(null)
// 错误信息
const error = ref(null)
// 是否为空数据
const isEmpty = ref(false)
// ResizeObserver 实例
let resizeObserver = null
// 自动刷新定时器
let refreshTimer = null

// 获取主题配置
const { getThemeOptions } = useTheme()

// 初始化图表
const initChart = async () => {
  try {
    error.value = null
    
    // 检查数据是否为空
    if (!checkData()) {
      isEmpty.value = true
      return
    }
    
    isEmpty.value = false
    
    await nextTick()
    
    if (!chartRef.value) return
    
    // 如果实例已存在，先销毁
    if (chartInstance.value) {
      chartInstance.value.dispose()
    }
    
    // 创建图表实例
    chartInstance.value = echarts.init(chartRef.value, props.theme)
    
    // 生成图表配置
    const finalOptions = generateOptions()
    
    // 设置配置
    chartInstance.value.setOption(finalOptions, true)
    
    // 绑定事件
    bindEvents()
    
    // 通知图表就绪
    emit('ready', chartInstance.value)
    
  } catch (err) {
    console.error('图表初始化失败:', err)
    error.value = err.message || '图表渲染失败'
    emit('error', err)
  }
}

// 检查数据是否为空
const checkData = () => {
  if (!props.data) return false
  
  if (Array.isArray(props.data)) {
    return props.data.length > 0
  }
  
  if (typeof props.data === 'object') {
    return Object.keys(props.data).length > 0
  }
  
  return false
}

// 生成图表配置
const generateOptions = () => {
  // 获取默认配置
  const defaultOpts = getDefaultOptions(props.type, props.data)
  
  // 获取主题配置
  const themeOpts = getThemeOptions(props.theme)
  
  // 工具栏配置
  const toolboxOpts = props.showToolbox ? {
    toolbox: {
      feature: {
        saveAsImage: { title: '保存为图片' },
        dataView: { title: '数据视图', readOnly: false },
        restore: { title: '还原' },
        dataZoom: { title: { zoom: '区域缩放', back: '还原缩放' } }
      }
    }
  } : {}
  
  // 合并所有配置（深度合并）
  const finalOptions = merge(
    {},
    defaultOpts,
    themeOpts,
    toolboxOpts,
    props.options
  )
  
  return finalOptions
}

// 绑定事件
const bindEvents = () => {
  if (!chartInstance.value) return
  
  // 点击事件
  chartInstance.value.on('click', (params) => {
    emit('click', params)
  })
  
  // 可以添加更多事件监听
}

// 更新图表
const updateChart = () => {
  if (!chartInstance.value) {
    initChart()
    return
  }
  
  if (!checkData()) {
    isEmpty.value = true
    return
  }
  
  isEmpty.value = false
  
  try {
    const finalOptions = generateOptions()
    chartInstance.value.setOption(finalOptions, true)
  } catch (err) {
    console.error('图表更新失败:', err)
    error.value = err.message
    emit('error', err)
  }
}

// 防抖更新
const debouncedUpdate = debounce(updateChart, 300)

// 调整图表大小
const resizeChart = () => {
  if (chartInstance.value && !chartInstance.value.isDisposed()) {
    chartInstance.value.resize()
  }
}

// 防抖 resize
const debouncedResize = debounce(resizeChart, 150)

// 设置响应式监听
const setupResponsive = () => {
  if (!props.responsive || !chartRef.value) return
  
  // 使用 ResizeObserver 监听容器尺寸变化
  resizeObserver = new ResizeObserver(() => {
    debouncedResize()
  })
  
  resizeObserver.observe(chartRef.value)
}

// 设置自动刷新
const setupAutoRefresh = () => {
  if (props.autoRefresh > 0) {
    refreshTimer = setInterval(() => {
      emit('refresh')
      updateChart()
    }, props.autoRefresh)
  }
}

// 清理自动刷新
const clearAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 重试
const handleRetry = () => {
  error.value = null
  initChart()
}

// 监听数据变化
watch(
  () => props.data,
  () => {
    debouncedUpdate()
  },
  { deep: true }
)

// 监听配置变化
watch(
  () => props.options,
  () => {
    debouncedUpdate()
  },
  { deep: true }
)

// 监听主题变化
watch(
  () => props.theme,
  () => {
    // 主题变化需要重新初始化
    initChart()
  }
)

// 监听加载状态
watch(
  () => props.loading,
  (newVal) => {
    if (!newVal && chartInstance.value) {
      // 加载完成后更新图表
      nextTick(() => {
        updateChart()
      })
    }
  }
)

// 生命周期
onMounted(() => {
  initChart()
  setupResponsive()
  setupAutoRefresh()
})

onUnmounted(() => {
  // 清理图表实例
  if (chartInstance.value && !chartInstance.value.isDisposed()) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  
  // 清理 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  
  // 清理定时器
  clearAutoRefresh()
})

// 暴露方法给父组件
defineExpose({
  chartInstance,
  refresh: updateChart,
  resize: resizeChart,
  getImage: () => {
    if (chartInstance.value) {
      return chartInstance.value.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      })
    }
    return null
  }
})
</script>

<style scoped>
.base-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
}

.chart-loading,
.chart-empty,
.chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon,
.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.chart-error button {
  margin-top: 16px;
  padding: 8px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chart-error button:hover {
  background: #2980b9;
}
</style>