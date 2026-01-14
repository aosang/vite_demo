<template>
  <div class="pro-table">
    <!-- 工具栏 -->
    <div class="pro-table-toolbar" v-if="showToolbar">
      <div class="toolbar-left">
        <slot name="toolbarLeft"></slot>
      </div>
      <div class="toolbar-right">
        <a-space>
          <a-tooltip title="刷新">
            <a-button :loading="loading" @click="refresh">
              <template #icon>
                <ReloadOutlined />
              </template>
            </a-button>
          </a-tooltip>
          <!-- 列设置 -->
          <a-dropdown :trigger="['click']" :getPopupContainer="(triggerNode) => triggerNode.parentNode">
            <a-button>
              <template #icon>
                <SettingOutlined />
              </template>
            </a-button>
            <template #overlay>
              <div class="dropdown-content">
                <ColumnSetting 
                  v-model:value="columnState" 
                  :columns="columns" 
                />
              </div>
            </template>
          </a-dropdown>

          <!-- 导出 -->
          <a-tooltip title="导出">
            <a-button @click="handleExport">
              <template #icon>
                <ExportOutlined />
              </template>
            </a-button>
          </a-tooltip>

          <slot name="toolbarRight"></slot>
        </a-space>
      </div>
    </div>

    <!-- 表格主体 -->
    <a-table 
      v-bind="$attrs"
      :columns="processedColumns" 
      :data-source="dataSource" 
      :loading="loading"
      :pagination="paginationConfig" 
      :row-key="rowKey" 
      @change="handleTableChange"
    >
      <!-- 透传所有插槽 -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}"></slot>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ReloadOutlined, SettingOutlined, ExportOutlined } from '@ant-design/icons-vue'
import ColumnSetting from './ColumnSetting.vue'
import { exportToExcel } from '@/utils/export'
import { debounce } from 'lodash-es'

const props = defineProps({
  // 列配置
  columns: {
    type: Array,
    required: true
  },

  // 数据请求函数
  request: {
    type: Function,
    required: true
  },

  // 额外请求参数
  params: {
    type: Object,
    default: () => ({})
  },

  // 行唯一标识
  rowKey: {
    type: [String, Function],
    default: 'id'
  },

  // 是否显示工具栏
  showToolbar: {
    type: Boolean,
    default: true
  },

  // 分页配置
  pagination: {
    type: [Object, Boolean],
    default: () => ({})
  }
})

const emit = defineEmits(['change'])

const route = useRoute()
const router = useRouter()


// 表格数据
const dataSource = ref([])
const loading = ref(false)
const total = ref(0)

// 表格参数
const tableParams = ref({
  current: 1,
  pageSize: 10,
  sorter: { field: 'id', order: 'ascend' },
  filters: {},
})

// 列状态（顺序、显示隐藏）
const columnState = ref({
  order: (props.columns || []).map(col => col.dataIndex),
  show: (props.columns || []).reduce((acc, col) => {
    acc[col.dataIndex] = true
    return acc
  }, {})
})

// 从 URL 初始化参数
onMounted(() => {
  const query = route.query
  if (query.current) tableParams.value.current = Number(query.current)
  if (query.pageSize) tableParams.value.pageSize = Number(query.pageSize)
  if (query.sorter) {
    const [field, order] = query.sorter.split(':')
    tableParams.value.sorter = { field, order }
  }
  if (query.filters) {
    try {
      tableParams.value.filters = JSON.parse(atob(query.filters))
    } catch (e) {
      console.error('解析筛选参数失败', e)
    }
  }

  // 加载数据
  fetchData()
})

// 处理后的列配置
const processedColumns = computed(() => {
  return columnState.value.order
    .map(key => props.columns.find(col => col.dataIndex === key))
    .filter(col => col && columnState.value.show[col.dataIndex])
    .map(col => {
      const column = { ...col }

      // 处理排序
      if (column.sorter) {
        column.sortOrder =
          tableParams.value.sorter?.field === column.dataIndex? tableParams.value.sorter.order : null
      }

      // 处理筛选
      if (column.filters) {
        column.filteredValue = tableParams.value.filters[column.dataIndex] || null
      }

      return column
    })
})

// 分页配置
const paginationConfig = computed(() => {
  if (props.pagination === false) return false

  return {
    current: tableParams.value.current,
    pageSize: tableParams.value.pageSize,
    total: total.value,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    ...props.pagination,
  }
})

// 请求数据
async function fetchData() {
  // 增加安全判断：如果 request 不是函数，直接退出，避免报错
  if (typeof props.request !== 'function') {
    console.warn('ProTable: props.request 必须是一个函数');
    return;
  }

  loading.value = true
  try {
    const requestParams = {
      current: tableParams.value.current,
      pageSize: tableParams.value.pageSize,
      ...tableParams.value.filters,
      ...props.params,
    }

    // 添加排序参数
    if (tableParams.value.sorter) {
      requestParams.sortField = tableParams.value.sorter.field
      requestParams.sortOrder = tableParams.value.sorter.order
    }

    const result = await props.request(requestParams)

    dataSource.value = result.data || []
    total.value = result.total || 0
  }catch(error) {
    console.error('请求数据失败', error)
    message.error('加载数据失败')
  }finally {
    loading.value = false
  }
}


// 表格变化处理
function handleTableChange(pagination, filters, sorter) {
  // 更新参数
  tableParams.value.current = pagination.current
  tableParams.value.pageSize = pagination.pageSize

  // 处理排序
  if (sorter.field) {
    tableParams.value.sorter = {
      field: sorter.field,
      order: sorter.order,
    }
  } else {
    tableParams.value.sorter = null
  }

  // 处理筛选
  const activeFilters = {}
  Object.keys(filters).forEach(key => {
    if (filters[key] && filters[key].length > 0) {
      activeFilters[key] = filters[key]
    }
  })
  
  // 筛选变化时重置到第一页
  if (JSON.stringify(activeFilters) !== JSON.stringify(tableParams.value.filters)) {
    tableParams.value.current = 1
  }
  
  tableParams.value.filters = activeFilters

  // 同步到 URL
  updateURL()

  // 重新请求数据
  fetchData()

  // 触发事件
  emit('change', tableParams.value)
}

// 更新 URL(防抖)
const updateURL = debounce(() => {
  const query = {
    current: tableParams.value.current,
    pageSize: tableParams.value.pageSize,
  }

  if (tableParams.value.sorter) {
    query.sorter = `${tableParams.value.sorter.field}:${tableParams.value.sorter.order}`
  }

  if (Object.keys(tableParams.value.filters).length > 0) {
    query.filters = btoa(JSON.stringify(tableParams.value.filters))
  }

  router.replace({ query })
}, 300)

// 刷新
function refresh() {
  fetchData()
}

// 导出
function handleExport() {
  exportToExcel(
    processedColumns.value,
    dataSource.value,
    '表格数据.xlsx'
  )
  message.success('导出成功')
}

// 暴露方法
defineExpose({
  refresh,
  fetchData,
  getTableData: () => dataSource.value,
  getParams: () => tableParams.value,
})

</script>

<style scoped>
.pro-table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.dropdown-content {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
}
</style>