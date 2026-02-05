<template>
  <div class="track-playback">
    <div ref="mapContainer" class="map-container"></div>
    <div class="playback-controls">
      <button @click="togglePlay">{{ isPlaying ? '暂停' : '播放' }}</button>
      <button @click="reset">重置</button>
      <input 
        type="range" 
        v-model="speed" 
        min="0.5" 
        max="5" 
        step="0.5"
      />
      <span>{{ speed }}x</span>
      <div class="progress">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
      <span>{{ currentTime }} / {{ totalTime }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  trackData: { 
    type: Array, 
    required: false,
    default: () => []
  }
})

const mapContainer = ref(null)
const isPlaying = ref(false)
const speed = ref(1)
const currentIndex = ref(0)
const progress = ref(0)

let map = null
let marker = null
let polyline = null
let animationId = null
let lastTime = 0
let segmentProgress = 0  // 当前段的进度 (0-1)

// 插值计算中间点
const interpolate = (start, end, progress) => {
  return {
    lng: start.lng + (end.lng - start.lng) * progress,
    lat: start.lat + (end.lat - start.lat) * progress
  }
}

// 计算两点之间的角度（用于图标旋转）
// 车辆图片默认朝右（东），所以需要调整角度
const calculateAngle = (start, end) => {
  const dx = end.lng - start.lng
  const dy = end.lat - start.lat
  
  // atan2 返回的是从 x 轴正方向（东）开始的角度
  const radian = Math.atan2(dy, dx)
  
  // 转换为角度并调整：车辆图片默认朝右（东，90度）
  // 所以我们需要让计算结果匹配这个默认方向
  let angle = radian * 180 / Math.PI
  
  console.log('角度计算:', { dx, dy, angle: angle.toFixed(1) })
  
  return angle
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const currentTime = computed(() => {
  if (props.trackData.length === 0) return '0:00'
  const current = props.trackData[currentIndex.value]
  const start = props.trackData[0]
  return formatTime((current.timestamp - start.timestamp) / 1000)
})

const totalTime = computed(() => {
  if (props.trackData.length < 2) return '0:00'
  const end = props.trackData[props.trackData.length - 1]
  const start = props.trackData[0]
  return formatTime((end.timestamp - start.timestamp) / 1000)
})

const animate = (timestamp) => {
  if (!isPlaying.value) return

  if (lastTime === 0) {
    lastTime = timestamp
    animationId = requestAnimationFrame(animate)
    return
  }

  const deltaTime = timestamp - lastTime
  lastTime = timestamp

  if (currentIndex.value >= props.trackData.length - 1) {
    console.log('动画完成')
    isPlaying.value = false
    return
  }

  // 计算当前位置
  const start = props.trackData[currentIndex.value]
  const end = props.trackData[currentIndex.value + 1]
  const timeDiff = end.timestamp - start.timestamp
  
  // 累加进度（考虑速度和真实时间差）
  segmentProgress += (deltaTime * speed.value) / timeDiff

  // 限制在 0-1 之间
  const interpolationProgress = Math.min(segmentProgress, 1)

  const position = interpolate(start, end, interpolationProgress)
  
  // 计算图标角度
  const angle = calculateAngle(start, end)
  
  console.log('动画中:', {
    currentIndex: currentIndex.value,
    segmentProgress: interpolationProgress.toFixed(2),
    position,
    angle: angle.toFixed(1),
    marker: !!marker
  })
  
  // 更新标记位置和角度
  if (marker) {
    marker.setPosition([position.lng, position.lat])
    marker.setAngle(angle)
  }

  // 更新总体进度
  progress.value = ((currentIndex.value + interpolationProgress) / props.trackData.length) * 100

  // 如果当前段完成，移动到下一段
  if (segmentProgress >= 1) {
    currentIndex.value++
    segmentProgress = 0
  }

  animationId = requestAnimationFrame(animate)
}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  console.log('togglePlay:', isPlaying.value, 'trackData length:', props.trackData.length)
  if (isPlaying.value) {
    lastTime = 0  // 重置时间
    animationId = requestAnimationFrame(animate)
  } else {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
}

const reset = () => {
  isPlaying.value = false
  currentIndex.value = 0
  progress.value = 0
  lastTime = 0
  segmentProgress = 0
  
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  if (marker && props.trackData.length > 1) {
    const start = props.trackData[0]
    const end = props.trackData[1]
    marker.setPosition([start.lng, start.lat])
    // 重置为初始方向
    marker.setAngle(calculateAngle(start, end))
  }
}

onMounted(() => {
  // 检查 AMap 是否已加载
  if (typeof AMap === 'undefined') {
    console.error('高德地图 SDK 未加载，请检查 index.html 中的配置')
    return
  }

  console.log('初始化地图，轨迹数据点数:', props.trackData.length)

  map = new AMap.Map(mapContainer.value, {
    center: [116.397428, 39.90923],
    zoom: 13
  })

  if (props.trackData.length > 0) {
    const path = props.trackData.map(p => [p.lng, p.lat])
    
    // 绘制轨迹线（带圆滑效果和阴影）
    polyline = new AMap.Polyline({
      path: path,
      strokeColor: '#3366FF',
      strokeWeight: 6,
      strokeOpacity: 0.9,
      lineJoin: 'round',    // 连接处圆滑
      lineCap: 'round',     // 端点圆滑
      showDir: false,       // 不显示箭头（我们用车辆图标表示方向）
      isOutline: true,      // 显示描边
      outlineColor: '#ffffff', // 描边颜色
      borderWeight: 2       // 描边宽度
    })
    polyline.setMap(map)
    
    // 添加起点和终点标记
    new AMap.Marker({
      position: path[0],
      icon: new AMap.Icon({
        size: new AMap.Size(25, 34),
        image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
        imageSize: new AMap.Size(25, 34)
      }),
      offset: new AMap.Pixel(-13, -34),
      label: {
        content: '起点',
        offset: new AMap.Pixel(0, -35),
        direction: 'top'
      }
    }).setMap(map)
    
    new AMap.Marker({
      position: path[path.length - 1],
      icon: new AMap.Icon({
        size: new AMap.Size(25, 34),
        image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
        imageSize: new AMap.Size(25, 34)
      }),
      offset: new AMap.Pixel(-13, -34),
      label: {
        content: '终点',
        offset: new AMap.Pixel(0, -35),
        direction: 'top'
      }
    }).setMap(map)

    // 计算初始角度
    const initialAngle = props.trackData.length > 1 ? 
      calculateAngle(props.trackData[0], props.trackData[1]) : 0

    // 创建移动标记（使用高德地图自带的车辆图片）
    marker = new AMap.Marker({
      position: [props.trackData[0].lng, props.trackData[0].lat],
      icon: 'https://webapi.amap.com/images/car.png',
      offset: new AMap.Pixel(-26, -13),
      angle: initialAngle,
      autoRotation: false
    })
    marker.setMap(map)

    console.log('地图初始化完成，marker:', !!marker, 'polyline:', !!polyline)

    // 自适应视野
    map.setFitView()
  }
})
</script>

<style scoped>
.track-playback {
  width: 100%;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.map-container {
  flex: 1;
}

.playback-controls {
  padding: 15px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  gap: 10px;
}

button {
  padding: 8px 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #1976D2;
}

input[type="range"] {
  width: 100px;
}

.progress {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #2196F3;
  transition: width 0.3s;
}
</style>