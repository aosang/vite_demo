// chartConfig.js
export const getDefaultOptions = (type, data) => {
  const configs = {
    line: getLineOptions(data),
    bar: getBarOptions(data),
    pie: getPieOptions(data),
    scatter: getScatterOptions(data),
    radar: getRadarOptions(data)
  }
  
  return configs[type] || {}
}

// 折线图默认配置
const getLineOptions = (data) => {
  return {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: data.series?.map(s => s.name) || []
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.xAxis || []
    },
    yAxis: {
      type: 'value'
    },
    series: data.series?.map(s => ({
      name: s.name,
      type: 'line',
      smooth: true,
      data: s.data,
      emphasis: {
        focus: 'series'
      }
    })) || []
  }
}

// 柱状图默认配置
const getBarOptions = (data) => {
  return {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: data.series?.map(s => s.name) || []
    },
    xAxis: {
      type: 'category',
      data: data.xAxis || []
    },
    yAxis: {
      type: 'value'
    },
    series: data.series?.map(s => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      emphasis: {
        focus: 'series'
      },
      itemStyle: {
        borderRadius: [4, 4, 0, 0]
      }
    })) || []
  }
}

// 饼图默认配置
const getPieOptions = (data) => {
  // 饼图数据可能是数组或对象格式
  const pieData = Array.isArray(data) ? data : (data.data || [])
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: pieData.map(d => d.name)
    },
    series: [
      {
        name: data.name || '数据',
        type: 'pie',
        radius: '50%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {d}%'
        }
      }
    ]
  }
}

// 散点图默认配置
const getScatterOptions = (data) => {
  return {
    grid: {
      left: '3%',
      right: '7%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'item'
    },
    xAxis: {
      type: 'value',
      scale: true
    },
    yAxis: {
      type: 'value',
      scale: true
    },
    series: data.series?.map(s => ({
      name: s.name,
      type: 'scatter',
      data: s.data,
      symbolSize: 8,
      emphasis: {
        focus: 'series'
      }
    })) || []
  }
}

// 雷达图默认配置
const getRadarOptions = (data) => {
  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: data.series?.map(s => s.name) || []
    },
    radar: {
      indicator: data.indicator || []
    },
    series: [
      {
        type: 'radar',
        data: data.series || []
      }
    ]
  }
}