<!-- DynamicForm核心组件 -->
<template>
  <div class="dynamic-form">
    <a-form
      ref="formRef"
      :model="formData"
      :layout="schema.layout || 'vertical'"
      v-bind="$attrs"
      class="form-content"
    >
      <component
        v-for="field in visibleFields"
        :key="field.name"
        :is="getFieldComponent(field)"
        :field="field"
        :form-data="formData"
        :disabled="getFieldDisabled(field)"
        @update:value="handleFieldChange(field.name, $event)"
      />

      <slot name="footer" :form-data="formData" :validate="validate">
        <a-form-item v-if="showSubmit">
          <a-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ submitText }}
          </a-button>
          <a-button style="margin-left: 8px" @click="handleReset">
            重置
          </a-button>
        </a-form-item>
      </slot>
    </a-form>
  </div>
  
</template>

<script setup>
import { ref, reactive, computed, watch, provide } from 'vue'
import FieldGraph from '@/utils/DynamicForm/FieldGraph'
import ExpressionEngine from '@/utils/DynamicForm/ExpressionEngine'
import FormField from '@/components/DynamicForm/FormField.vue'

const props = defineProps({
  schema: {
    type: Object,
    required: true,
  },
  initialValues: {
    type: Object,
    default: () => ({}),
  },
  showSubmit: {
    type: Boolean,
    default: true,
  },
  submitText: {
    type: String,
    default: '提交',
  },
})

const emit = defineEmits(['submit', 'change'])

const formRef = ref()
const submitting = ref(false)

// 表单数据
const formData = reactive({})

// 字段依赖图
const fieldGraph = new FieldGraph()

// 表达式引擎
const expressionEngine = new ExpressionEngine()

// 字段状态缓存
const fieldStates = reactive({})

// 初始化
function init() {
  // 构建依赖图
  props.schema.fields.forEach(field => {
    if (field.dependencies) {
      field.dependencies.forEach(dep => {
        fieldGraph.addDependency(dep, field.name)
      })
    }
  })

  // 初始化表单数据
  props.schema.fields.forEach(field => {
    const initialValue = props.initialValues[field.name]
    if (initialValue !== undefined) {
      formData[field.name] = initialValue
    } else if (field.defaultValue !== undefined) {
      formData[field.name] = field.defaultValue
    }
  })

  // 初始化字段状态
  props.schema.fields.forEach(field => {
    fieldStates[field.name] = {
      visible: true,
      disabled: false,
    }
  })

  // 计算初始状态
  updateAllFieldStates()
}

init()

// 可见字段
const visibleFields = computed(() => {
  return props.schema.fields.filter(field => {
    return fieldStates[field.name]?.visible !== false
  })
})

// 获取字段组件
function getFieldComponent(field) {
  // 可以根据 field.type 返回不同的组件
  // 这里简化为统一用 FormField
  return FormField
}

// 获取字段禁用状态
function getFieldDisabled(field) {
  return fieldStates[field.name]?.disabled || false
}

// 字段值变化
function handleFieldChange(fieldName, value) {
  formData[fieldName] = value
  
  // 更新依赖字段
  const affectedFields = fieldGraph.getAffectedFields(fieldName)
  const sortedFields = fieldGraph.getSortedFields(affectedFields)
  
  sortedFields.forEach(name => {
    updateFieldState(name)
  })

  emit('change', formData)
}

// 更新单个字段状态
function updateFieldState(fieldName) {
  const field = props.schema.fields.find(f => f.name === fieldName)
  if (!field) return

  const state = fieldStates[fieldName]

  // 计算 visible
  if (field.visible !== undefined) {
    if (typeof field.visible === 'boolean') {
      state.visible = field.visible
    } else {
      state.visible = expressionEngine.evaluate(field.visible, formData)
    }
  }

  // 计算 disabled
  if (field.disabled !== undefined) {
    if (typeof field.disabled === 'boolean') {
      state.disabled = field.disabled
    } else {
      state.disabled = expressionEngine.evaluate(field.disabled, formData)
    }
  }
}

// 更新所有字段状态
function updateAllFieldStates() {
  props.schema.fields.forEach(field => {
    updateFieldState(field.name)
  })
}

// 校验表单
async function validate() {
  try {
    await formRef.value.validate()
    return true
  } catch (error) {
    return false
  }
}

// 提交
async function handleSubmit() {
  const valid = await validate()
  if (!valid) return

  submitting.value = true
  try {
    emit('submit', formData)
  } finally {
    submitting.value = false
  }
}

// 重置
function handleReset() {
  formRef.value.resetFields()
}

// 暴露方法
defineExpose({
  validate,
  getFieldsValue: () => formData,
  setFieldsValue: (values) => Object.assign(formData, values),
  resetFields: handleReset,
})
</script>

<style scoped>
.dynamic-form {
  padding: 20px;
  background-color: #f5f5f5;
  box-sizing: border-box;
}

.form-content {
  width: 100%;
}
</style>