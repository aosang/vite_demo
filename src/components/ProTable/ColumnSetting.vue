<template>
  <div class="column-setting">
    <div class="column-setting-header">
      <span>列设置</span>
      <a @click="resetColumns">重置</a>
    </div>

    <div class="column-setting-body">
      <draggable 
        v-model="localOrder" 
        item-key="el => el"
        handle=".drag-handle"
        tag="div"
      >
        <template #item="{ element }">
          <div class="column-item">
            <MenuOutlined class="drag-handle" />
            <a-checkbox 
              :checked="localShow[element]" 
              @change="(e) => handleShowChange(element, e.target.checked)"
            >
              {{ getColumnTitle(element) }}
            </a-checkbox>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { MenuOutlined } from '@ant-design/icons-vue'
import draggable from 'vuedraggable'

const props = defineProps({
  value: {
    type: Object,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:value'])

// 本地状态
const localOrder = ref([...props.value.order])
const localShow = ref({ ...props.value.show })

// 监听外部 props 变化同步到本地 (处理重置等场景)
watch(() => props.value, (newVal) => {
  const isOrderSame = JSON.stringify(newVal.order) === JSON.stringify(localOrder.value)
  const isShowSame = JSON.stringify(newVal.show) === JSON.stringify(localShow.value)
  
  if (!isOrderSame) localOrder.value = [...newVal.order]
  if (!isShowSame) localShow.value = { ...newVal.show }
}, { deep: true })

// 监听本地变化,同步到父组件
watch(
  [localOrder, localShow],
  () => {
    const isOrderSame = JSON.stringify(localOrder.value) === JSON.stringify(props.value.order)
    const isShowSame = JSON.stringify(localShow.value) === JSON.stringify(props.value.show)
    
    if (!isOrderSame || !isShowSame) {
      emit('update:value', {
        order: [...localOrder.value],
        show: { ...localShow.value },
      })
    }
  },
  { deep: true }
)

// 获取列标题
function getColumnTitle(dataIndex) {
  const column = props.columns.find(col => col.dataIndex === dataIndex)
  return column?.title || dataIndex
}

// 切换显示
function handleShowChange(dataIndex, show) {
  localShow.value = {
    ...localShow.value,
    [dataIndex]: show
  }
}

// 重置
function resetColumns() {
  const order = props.columns.map(col => col.dataIndex)
  const show = {}
  props.columns.forEach(col => {
    show[col.dataIndex] = true
  })
  
  emit('update:value', { order, show })
}

</script>

<style scoped>
.column-setting {
  width: 250px;
  padding: 12px;
}

.column-setting-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 500;
}

.column-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: move;
}

.column-item:hover {
  background: #f5f5f5;
}

.drag-handle {
  cursor: move;
  color: #999;
}
</style>