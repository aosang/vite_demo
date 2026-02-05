<template>
  <div>
    <Gmap :trackData="trackData" />
  </div>
</template>

<script setup>
import Gmap from '../components/Gmap/gmap.vue'
import { ref } from 'vue'
// 模拟真实的折线轨迹数据（更多点，形成曲线）
const trackData = ref([
  { lng: 116.397428, lat: 39.90923, timestamp: 1609459200000 },
  { lng: 116.398428, lat: 39.91023, timestamp: 1609459202000 },
  { lng: 116.399428, lat: 39.91123, timestamp: 1609459204000 },
  { lng: 116.400428, lat: 39.91223, timestamp: 1609459206000 },
  { lng: 116.401628, lat: 39.91253, timestamp: 1609459208000 },
  { lng: 116.402828, lat: 39.91223, timestamp: 1609459210000 },
  { lng: 116.403828, lat: 39.91123, timestamp: 1609459212000 },
  { lng: 116.404528, lat: 39.91023, timestamp: 1609459214000 },
  { lng: 116.405228, lat: 39.90923, timestamp: 1609459216000 },
  { lng: 116.406028, lat: 39.90823, timestamp: 1609459218000 },
  { lng: 116.406828, lat: 39.90723, timestamp: 1609459220000 },
  { lng: 116.407628, lat: 39.90623, timestamp: 1609459222000 },
  { lng: 116.408628, lat: 39.90573, timestamp: 1609459224000 },
  { lng: 116.409828, lat: 39.90623, timestamp: 1609459226000 },
  { lng: 116.410828, lat: 39.90723, timestamp: 1609459228000 },
  { lng: 116.411628, lat: 39.90823, timestamp: 1609459230000 },
  { lng: 116.412428, lat: 39.90923, timestamp: 1609459232000 },
  { lng: 116.413228, lat: 39.91023, timestamp: 1609459234000 },
  { lng: 116.414028, lat: 39.91123, timestamp: 1609459236000 },
  { lng: 116.414828, lat: 39.91223, timestamp: 1609459238000 }
])
</script>

<style scoped>

</style>