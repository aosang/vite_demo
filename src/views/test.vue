<template>
  <!-- <div class="form-box"> -->
    <!-- <div class="form-box-item">
      <input 
        v-model="formData.username" 
        type="text" placeholder="用户名" 
        :class="errorMessage === '用户名不能为空' ? 'error' : ''"
        @input="handleInput"
      >
    </div>
    <div class="form-box-item">
      <input 
        v-model="formData.company" 
        type="text" 
        placeholder="公司名" 
        :class="errorMessage === '公司名不能为空' ? 'error' : ''"
        @input="handleInput"
      >
    </div>
    <div class="form-box-item">
      <input 
        v-model="formData.password" 
        type="text" 
        placeholder="密码" 
        :class="errorMessage === '密码不能为空' ? 'error' : ''"
        @input="handleInput"
      >
    </div>
    <div class="form-box-item">
      <a-button 
        type="primary" 
        class="submit"
        :disabled="errorMessage !== true"
      >
        提交表单
      </a-button>
    </div> -->
  <!-- </div> -->
  <!-- <div class="flex-box">
    <p class="slide">侧边栏</p>
    <p class="content">内容栏</p>
  </div> -->
  <VirtualTableWithInfinite
    :columns="columns"
    :data="tableData"
    :height="300"
    :row-height="50"
    row-key="id"
    :load-more="loadMore"
    :has-more="hasMore"
  >
    <template #cell-action="{ row }">
      <button @click="handleAction(row)">操作</button>
    </template>
  </VirtualTableWithInfinite>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { VirtualTableWithInfinite } from 'vue-virtual-kit'
import 'vue-virtual-kit/style.css'

const columns = [
  { key: 'id',     title: 'ID',   dataIndex: 'id',    width: 80 },
  { key: 'name',   title: '姓名', dataIndex: 'name',  width: 120 },
  { key: 'email',  title: '邮箱', dataIndex: 'email', width: 200 },
  { key: 'action', title: '操作', dataIndex: 'action', width: 100 },
]

const PAGE_SIZE = 50

const tableData = ref(
  Array.from({ length: PAGE_SIZE }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    email: `user${i}@example.com`,
  }))
)

const hasMore = ref(true)
let page = 0

async function loadMore() {
  await new Promise(resolve => setTimeout(resolve, 600))
  page++
  const newRows = Array.from({ length: PAGE_SIZE }, (_, i) => ({
    id: page * PAGE_SIZE + i,
    name: `User ${page * PAGE_SIZE + i}`,
    email: `user${page * PAGE_SIZE + i}@example.com`,
  }))
  tableData.value = [...tableData.value, ...newRows]
  if (tableData.value.length >= 300) hasMore.value = false
}

function handleAction(row) {
  alert(`操作：${row.name}`)
}
</script>

<style scoped>
.form-box {
  width: 300px;
  margin: 20px auto;
}

.form-box-item input {
  appearance: none;
  width: 100%;
  height: 36px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
  box-sizing: border-box;
  padding-left: 12px;
  font-size: 15px;
  outline: none;
  border-radius: 2px;
}

.form-box-item input::-webkit-input-placeholder {
  color: #ccc;
}

.form-box-item .submit {
  width: 100%;
  height: 36px;
}

.form-box-item .error {
  border: 1px solid #fa5c5c;
}

.flex-box {
  display: flex;
}

.flex-box .slide {
  flex-basis: 200px;
  background: skyblue;
  flex-shrink: 0;
}

.flex-box .content {
  flex-grow: 1;
  background: #fa5c5c;
}
</style>