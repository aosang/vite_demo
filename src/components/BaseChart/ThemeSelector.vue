<!-- ThemeSelector.vue -->
<template>
  <div class="theme-selector">
    <button 
      v-for="name in themeNames" 
      :key="name"
      :class="['theme-btn', { active: currentTheme === name }]"
      @click="handleThemeChange(name)"
    >
      {{ name }}
    </button>
  </div>
</template>

<script setup>
import { useTheme } from '@/utils/chartConfig/useTheme'

const { currentTheme, getThemeNames, setTheme } = useTheme()
const themeNames = getThemeNames()

const emit = defineEmits(['change'])

const handleThemeChange = (name) => {
  setTheme(name)
  emit('change', name)
}
</script>

<style scoped>
.theme-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.theme-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-btn:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.theme-btn.active {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}
</style>