<!-- components/LocaleSwitcher.vue -->
<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { changeLocale } from '@/utils/i18n'

const { locale, t } = useI18n()
const loading = ref(false)

const locales = [
  { 
    code: 'zh-CN', 
    name: '简体中文', 
    flag: '🇨🇳',
    dir: 'ltr'
  },
  { 
    code: 'en-US', 
    name: 'English', 
    flag: '🇺🇸',
    dir: 'ltr'
  },
  { 
    code: 'ja-JP', 
    name: '日本語', 
    flag: '🇯🇵',
    dir: 'ltr'
  },
  { 
    code: 'ko-KR', 
    name: '한국어', 
    flag: '🇰🇷',
    dir: 'ltr'
  }
]

const currentLocale = computed(() => {
  return locales.find(l => l.code === locale.value)
})

async function handleChange(newLocale) {
  if (newLocale === locale.value) return
  
  loading.value = true
  
  try {
    await changeLocale(newLocale)
    
    // 切换文档方向
    const direction = locales.find(l => l.code === newLocale)?.dir || 'ltr'
    document.documentElement.dir = direction
    
    // 刷新页面（如果需要）
    // location.reload()
  } catch (error) {
    console.error('切换语言失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="locale-switcher">
    <el-dropdown @command="handleChange" :disabled="loading">
      <span class="trigger">
        <span class="flag">{{ currentLocale?.flag }}</span>
        <span class="name">{{ currentLocale?.name }}</span>
        <i class="el-icon-arrow-down"></i>
      </span>
      
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="item in locales"
            :key="item.code"
            :command="item.code"
            :disabled="item.code === locale"
          >
            <span class="menu-item">
              <span class="flag">{{ item.flag }}</span>
              <span class="name">{{ item.name }}</span>
              <i v-if="item.code === locale" class="el-icon-check"></i>
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    
    <div 
      v-if="loading" 
      v-loading="loading"
      :element-loading-text="t('common.switching')"
      element-loading-background="rgba(255, 255, 255, 0.9)"
      class="loading-overlay"
    ></div>
  </div>
</template>

<style scoped>
.locale-switcher {
  position: relative;
}

.trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
}

.trigger:hover {
  background: #f5f7fa;
  border-radius: 4px;
}

.flag {
  font-size: 18px;
}

.name {
  font-size: 14px;
  color: #606266;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.menu-item .el-icon-check {
  margin-left: auto;
  color: #409eff;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>