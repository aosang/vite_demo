<!-- ChartLinkage.vue -->
<template>
  <div class="chart-linkage">
    <ThemeSelector @change="handleThemeChange"  />
    <div class="chart-row">
      <BaseChart
        ref="chart1Ref"
        type="bar"
        :data="barData"
        :options="barOptions"
        :theme="currentTheme"
        @click="handleBarClick"
        height="300px"
      />
    </div>
    
    <div class="chart-row">
      <BaseChart
        ref="chart2Ref"
        type="line"
        :data="lineData"
        :options="lineOptions"
        :theme="currentTheme"
        height="300px"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseChart from '@/components/BaseChart/BaseChart.vue'
import * as echarts from 'echarts'
import ThemeSelector from '@/components/BaseChart/ThemeSelector.vue'

const chart1Ref = ref(null)
const chart2Ref = ref(null)

// 选中的类别
const selectedCategory = ref(null)

const currentTheme = ref('default')

// 柱状图数据
const barData = ref({
  xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  series: [{
    name: '销售额',
    data: [120, 200, 150, 80, 70, 110, 130]
  }]
})

const barOptions = ref({
  emphasis: {
    focus: 'series',
    blurScope: 'coordinateSystem'
  }
})

// 折线图数据
const lineData = ref({
  xAxis: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
  series: [{
    name: '访问量',
    data: [10, 20, 30, 40, 35, 25, 15]
  }]
})

const lineOptions = ref({})

// 处理柱状图点击
const handleBarClick = (params) => {
  selectedCategory.value = params.name
  
  // 高亮当前选中的柱子
  const chart1 = chart1Ref.value?.chartInstance
  if (chart1) {
    chart1.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: params.dataIndex
    })
  }
  
  // 更新折线图数据（模拟钻取）
  updateLineChart(params.name)
}

// 更新折线图数据
const updateLineChart = (category) => {
  // 模拟根据选中类别获取详细数据
  const detailData = {
    '周一': [12, 15, 20, 35, 30, 25, 18],
    '周二': [20, 25, 30, 45, 40, 35, 28],
    '周三': [15, 18, 25, 35, 32, 28, 20],
    '周四': [8, 12, 18, 25, 22, 18, 10],
    '周五': [7, 10, 15, 22, 20, 15, 8],
    '周六': [11, 15, 22, 32, 28, 22, 15],
    '周日': [13, 18, 25, 35, 30, 25, 18]
  }
  
  lineData.value = {
    xAxis: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    series: [{
      name: `${category}访问量`,
      data: detailData[category] || []
    }]
  }
  
  lineOptions.value = {
    title: {
      text: `${category} 详细数据`,
      left: 'center'
    }
  }
}

// 实现双向联动
const setupLinkage = () => {
  const chart1 = chart1Ref.value?.chartInstance
  const chart2 = chart2Ref.value?.chartInstance
  
  if (!chart1 || !chart2) return
  
  // 连接图表
  echarts.connect([chart1, chart2])
  
  // 可以实现更多联动效果，比如同步缩放、同步提示等
}

const handleThemeChange = (theme) => {
  currentTheme.value = theme
}

// 组件挂载后设置联动
watch([chart1Ref, chart2Ref], () => {
  if (chart1Ref.value && chart2Ref.value) {
    setupLinkage()
  }
})
</script>

<style scoped>
.chart-linkage {
  padding: 20px;
}

.chart-row {
  margin-bottom: 20px;
}
</style>