<!-- 数组字段组件 -->
<template>
  <div class="array-field">
    <div
      v-for="(item, index) in localValue"
      :key="index"
      class="array-item"
    >
      <DynamicForm
        :schema="field.itemSchema"
        :initial-values="item"
        :show-submit="false"
        @change="handleItemChange(index, $event)"
      />
      <a-button
        type="link"
        danger
        @click="handleRemove(index)"
      >
        删除
      </a-button>
    </div>

    <a-button
      type="dashed"
      block
      @click="handleAdd"
      v-if="!maxItems || localValue.length < maxItems"
    >
      <template #icon><PlusOutlined /></template>
      添加{{ field.label }}
    </a-button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import DynamicForm from './DynamicForm.vue'

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  value: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:value'])

const localValue = ref([...props.value])

const maxItems = props.field.max

watch(() => props.value, (newVal) => {
  localValue.value = [...newVal]
})

function handleAdd() {
  localValue.value.push({})
  emit('update:value', localValue.value)
}

function handleRemove(index) {
  localValue.value.splice(index, 1)
  emit('update:value', localValue.value)
}

function handleItemChange(index, values) {
  localValue.value[index] = values
  emit('update:value', localValue.value)
}
</script>

<style scoped>
.array-item {
  position: relative;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
</style>