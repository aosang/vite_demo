<!-- views/VirtualListExample.vue -->
<template>
  <div class="page">
    <h1>虚拟滚动示例</h1>

    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab-button', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 基础虚拟列表 -->
    <div v-show="activeTab === 'basic'" class="demo-section">
      <h2>1. 基础虚拟列表（修复版）</h2>
      <p class="desc">支持 1000+ 条数据，动态高度，无重叠问题</p>
      
      <VirtualList
        :items="basicItems"
        :height="600"
        :estimated-item-height="80"
        item-key="id"
      >
        <template #default="{ item, index }">
          <div class="list-item">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-desc">{{ item.description }}</div>
            <div class="item-footer">
              <span>索引: {{ index }}</span>
              <span>ID: {{ item.id }}</span>
            </div>
          </div>
        </template>
      </VirtualList>
    </div>

    <!-- 无限加载虚拟列表 -->
    <div v-show="activeTab === 'infinite-list'" class="demo-section">
      <h2>2. 无限加载虚拟列表</h2>
      <p class="desc">滚动到底部自动加载更多数据</p>
      <div class="controls">
        <button @click="resetInfiniteList">重置</button>
        <span>当前数据: {{ infiniteItems.length }} 条</span>
      </div>

      <VirtualListWithInfinite
        ref="infiniteListRef"
        :items="infiniteItems"
        :height="600"
        :estimated-item-height="80"
        item-key="id"
        :load-more="loadMoreListItems"
        :has-more="hasMoreList"
        :threshold="300"
      >
        <template #default="{ item, index }">
          <div class="list-item">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-desc">{{ item.description }}</div>
            <div class="item-footer">
              <span>索引: {{ index }}</span>
              <span>ID: {{ item.id }}</span>
            </div>
          </div>
        </template>
      </VirtualListWithInfinite>
    </div>

    <!-- 无限加载虚拟表格 -->
    <div v-show="activeTab === 'infinite-table'" class="demo-section">
      <h2>3. 无限加载虚拟表格</h2>
      <p class="desc">表格形式展示，支持无限加载</p>
      <div class="controls">
        <button @click="resetInfiniteTable">重置</button>
        <span>当前数据: {{ tableData.length }} 条</span>
      </div>

      <VirtualTableWithInfinite
        ref="infiniteTableRef"
        :columns="columns"
        :data="tableData"
        :height="600"
        :row-height="50"
        row-key="id"
        :load-more="loadMoreTableData"
        :has-more="hasMoreTable"
        :threshold="300"
      >
        <template #cell-action="{ row }">
          <button class="action-btn" @click="handleAction(row)">操作</button>
        </template>
      </VirtualTableWithInfinite>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VirtualList from '@/components/VirtualTable/VirtualList.vue'
import VirtualListWithInfinite from '@/components/VirtualTable/VirtualListWithInfinite.vue'
import VirtualTableWithInfinite from '@/components/VirtualTable/VirtualTableWithInfinite.vue'

// 当前激活的标签页
const activeTab = ref('basic')

const tabs = [
  { key: 'basic', label: '基础虚拟列表' },
  { key: 'infinite-list', label: '无限加载列表' },
  { key: 'infinite-table', label: '无限加载表格' },
]

// ===== 1. 基础虚拟列表 =====
const basicItems = ref(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    title: `Item ${i}`,
    description: `This is description for item ${i}. ${
      i % 3 === 0 ? 'This is a longer description that will take more space.' : ''
    }`,
  }))
)

// ===== 2. 无限加载虚拟列表 =====
const infiniteListRef = ref()
const infiniteItems = ref([])
const hasMoreList = ref(true)
const currentListPage = ref(0)
const LIST_PAGE_SIZE = 50

// 初始化列表数据
function initInfiniteList() {
  infiniteItems.value = Array.from({ length: LIST_PAGE_SIZE }, (_, i) => ({
    id: i,
    title: `Item ${i}`,
    description: `This is description for item ${i}. ${
      i % 3 === 0 ? 'This is a longer description that will take more space.' : ''
    }`,
  }))
  currentListPage.value = 0  // 第一批数据是第 0 页
  hasMoreList.value = true
}

// 加载更多列表项
async function loadMoreListItems() {
  // 模拟 API 请求延迟
  await new Promise(resolve => setTimeout(resolve, 800))

  const nextPage = currentListPage.value + 1
  const start = nextPage * LIST_PAGE_SIZE
  const end = start + LIST_PAGE_SIZE

  const newItems = Array.from({ length: LIST_PAGE_SIZE }, (_, i) => ({
    id: start + i,
    title: `Item ${start + i}`,
    description: `This is description for item ${start + i}. ${
      (start + i) % 3 === 0 ? 'This is a longer description that will take more space.' : ''
    }`,
  }))

  infiniteItems.value = [...infiniteItems.value, ...newItems]
  currentListPage.value = nextPage

  // 模拟最多加载 500 条
  if (infiniteItems.value.length >= 500) {
    hasMoreList.value = false
  }
}

// 重置无限列表
function resetInfiniteList() {
  initInfiniteList()
  infiniteListRef.value?.reset()
}

// ===== 3. 无限加载虚拟表格 =====
const infiniteTableRef = ref()
const tableData = ref([])
const hasMoreTable = ref(true)
const currentTablePage = ref(0)
const TABLE_PAGE_SIZE = 50

const columns = [
  {
    key: 'id',
    title: 'ID',
    dataIndex: 'id',
    width: 80,
  },
  {
    key: 'name',
    title: '姓名',
    dataIndex: 'name',
    width: 120,
  },
  {
    key: 'email',
    title: '邮箱',
    dataIndex: 'email',
    width: 200,
  },
  {
    key: 'age',
    title: '年龄',
    dataIndex: 'age',
    width: 80,
  },
  {
    key: 'address',
    title: '地址',
    dataIndex: 'address',
    minWidth: 200,
  },
  {
    key: 'action',
    title: '操作',
    dataIndex: 'action',
    width: 100,
  },
]

// 初始化表格数据
function initInfiniteTable() {
  tableData.value = Array.from({ length: TABLE_PAGE_SIZE }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    age: 20 + (i % 50),
    address: `Address ${i}, City, Country`,
  }))
  currentTablePage.value = 0  // 第一批数据是第 0 页
  hasMoreTable.value = true
}

// 加载更多表格数据
async function loadMoreTableData() {
  // 模拟 API 请求延迟
  await new Promise(resolve => setTimeout(resolve, 800))

  const nextPage = currentTablePage.value + 1
  const start = nextPage * TABLE_PAGE_SIZE
  const end = start + TABLE_PAGE_SIZE

  const newData = Array.from({ length: TABLE_PAGE_SIZE }, (_, i) => ({
    id: start + i,
    name: `User ${start + i}`,
    email: `user${start + i}@example.com`,
    age: 20 + ((start + i) % 50),
    address: `Address ${start + i}, City, Country`,
  }))

  tableData.value = [...tableData.value, ...newData]
  currentTablePage.value = nextPage

  // 模拟最多加载 500 条
  if (tableData.value.length >= 500) {
    hasMoreTable.value = false
  }
}

// 重置无限表格
function resetInfiniteTable() {
  initInfiniteTable()
  infiniteTableRef.value?.reset()
}

// 处理操作按钮
function handleAction(row) {
  alert(`操作行: ${row.name}`)
}

// 初始化数据
initInfiniteList()
initInfiniteTable()
</script>

<style scoped>
.page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 24px;
  color: #333;
}

h2 {
  margin-bottom: 12px;
  color: #555;
  font-size: 20px;
}

.desc {
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: #3498db;
}

.tab-button.active {
  color: #3498db;
  border-bottom-color: #3498db;
  font-weight: 600;
}

.demo-section {
  margin-bottom: 48px;
}

.controls {
  margin-bottom: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.controls button {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.controls button:hover {
  background: #2980b9;
}

.controls span {
  color: #666;
  font-size: 14px;
}

.list-item {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
  transition: background 0.2s;
}

.list-item:hover {
  background: #f9f9f9;
}

.item-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.item-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.item-footer {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 16px;
}

.action-btn {
  padding: 4px 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s;
}

.action-btn:hover {
  background: #2980b9;
}
</style>