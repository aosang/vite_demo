<!-- 表格拖动 -->
<script setup lang="ts">
  import { reactive } from 'vue'
  import Draggable from '../utils/index'
  
  defineOptions({
    name: 'DraggableTable',
    directives: {
      Draggable
    }
  })
  
  interface TableData {
    id: number
    name: string
    age: number
    address: string
    dragging?: boolean // 添加此行
  }
  
  const tableData = reactive<TableData[]>([
    { id: 1, name: 'John', age: 20, address: '123 Main St' },
    { id: 2, name: 'Jane', age: 21, address: '456 Main St' },
    { id: 3, name: 'Jim', age: 22, address: '789 Main St' }
  ])
  
  const getRowClassName = ({ row }: { row: any }) => {
    return row.dragging ? 'dragging' : '';
  }
  
  </script>
  
  <template>
    <div class="main-table">
      <el-table 
        :data="tableData"
        :row-class-name="getRowClassName"
        row-key="id"
        border
        v-draggable="{ data: tableData }"
      >
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="age" label="Age" />
        <el-table-column prop="address" label="Address" />
      </el-table>
    </div>
  </template>
  
  <style scoped>
  .main-table {
    width: 1000px;
    margin: 20px auto 0 auto;
  }
  
  :deep(.dragging) {
    opacity: 1;
  }
  
  :deep(.dragging td) {
    background-color: #ecf5ff !important;
  }
  
  :deep(.el-table__row) {
    cursor: move;
  }
  </style>
  
  