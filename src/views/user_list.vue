<template>
  <div class="user-list">
    <ProTable
      ref="tableRef" 
      :columns="columns" 
      :request="fetchData"
      row-key="id"
    >
      <!-- 工具栏左侧 -->
      <template #toolbarLeft>
        <a-space>
          <a-input-search
            v-model:value="searchParams.keyword"
            placeholder="搜索用户名、邮箱"
            style="width: 250px"
            @search="handleSearch"
          />
          <a-button type="primary" @click="handleAdd">新增用户</a-button>
        </a-space>
      </template>

      <!-- 自定义列渲染 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="record.status === 'active' ? 'green' : 'red'">
            {{ record.status === 'active' ? '活跃' : '禁用' }}
          </a-tag>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a>编辑</a>
            <a style="color: #ff4d4f">删除</a>
          </a-space>
        </template>
      </template>
    </ProTable>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import ProTable from '../components/ProTable/ProTable.vue'
import { getUserList } from '../api/user'

const tableRef = ref()

// 搜索参数
const searchParams = reactive({
  keyword: '',
})

// 列配置
const columns = [
  {
    dataIndex: 'id',
    title: 'ID',
    width: 80,
    sorter: true,
  },
  {
    dataIndex: 'name',
    title: '用户名',
    width: 150,
    sorter: true,
    ellipsis: true,
  },
  {
    dataIndex: 'email',
    title: '邮箱',
    width: 200,
    ellipsis: true,
    copyable: true,
  },
  {
    dataIndex: 'age',
    title: '年龄',
    width: 80,
    valueType: 'digit',
    sorter: true,
  },
  {
    dataIndex: 'status',
    title: '状态',
    width: 100,
    filters: [
      { text: '活跃', value: 'active' },
      { text: '禁用', value: 'inactive' },
    ],
  },
  {
    dataIndex: 'createdAt',
    title: '创建时间',
    width: 180,
    valueType: 'dateTime',
    sorter: true,
  },
  {
    dataIndex: 'action',
    title: '操作',
    width: 150,
    fixed: 'right',
  }
]

async function fetchData(params) {
  try {
    const response = await getUserList(params)
    return {
      data: response.data,
      total: response.total,
      success: true,
    }
  } catch (error) {
    return {
      data: [],
      total: 0,
      success: false,
    }
  }
}

// 搜索
function handleSearch() {
  tableRef.value?.refresh()
}

// 新增
function handleAdd() {
  console.log('新增用户')
}

</script>

<style scoped>
.user-list {
  width: 1260px;
  margin: 0 auto;
}
</style>