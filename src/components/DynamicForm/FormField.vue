<!-- 字段渲染组件 -->
<template>
  <a-form-item
    :name="field.name"
    :label="field.label"
    :rules="field.rules"
    v-bind="field.formItemProps"
  >
    <!-- Input -->
    <a-input 
      v-if="field.type === 'input'"
      :value="formData[field.name]"
      @update:value="handleChange"
      :disabled="disabled"
      v-bind="field.props"
    />

    <!-- Textarea -->
    <a-textarea 
      v-else-if="field.type === 'textarea'"
      :value="formData[field.name]"
      @update:value="handleChange"
      :disabled="disabled"
      v-bind="field.props"
    />

    <!-- Select -->
    <a-select 
      v-else-if="field.type === 'select'"
      :value="formData[field.name]"
      @update:value="handleChange"
      :disabled="disabled"
      :options="selectOptions"
      v-bind="field.props"
    />

    <!-- Date Picker -->
    <a-date-picker 
      v-else-if="field.type === 'date'"
      :value="formData[field.name]"
      @update:value="handleChange"
      :disabled="disabled"
      v-bind="field.props"
    />

    <!-- Input Number -->
    <a-input-number 
      v-else-if="field.type === 'number'"
      :value="formData[field.name]"
      @update:value="handleChange"
      :disabled="disabled"
      v-bind="field.props"
    />

    <!-- Switch -->
    <a-switch 
      v-else-if="field.type === 'switch'"
      :checked="formData[field.name]"
      @update:checked="handleChange"
      :disabled="disabled"
      v-bind="field.props"
    />

    <!-- Radio -->
    <a-radio-group
      v-else-if="field.type === 'radio'"
      :value="formData[field.name]"
      @update:value="handleChange"
      :disabled="disabled"
      v-bind="field.props"
    >
      <a-radio
        v-for="option in field.options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </a-radio>
    </a-radio-group>

    <!-- Checkbox -->
    <a-checkbox-group
      v-else-if="field.type === 'checkbox'"
      :value="formData[field.name]"
      @update:value="handleChange"
      :disabled="disabled"
      v-bind="field.props"
    >
      <a-checkbox
        v-for="option in field.options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </a-checkbox>
    </a-checkbox-group>

    <!-- 数组类型(动态增减) -->
    <ArrayField
      v-else-if="field.type === 'array'"
      :field="field"
      :value="formData[field.name]"
      @update:value="handleChange"
    />

    <!-- 自定义渲染 -->
    <component
      v-else-if="field.render"
      :is="field.render"
      :value="formData[field.name]"
      :field="field"
      :form-data="formData"
      @update:value="handleChange"
    />
  </a-form-item>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ArrayField from './ArrayField.vue'

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  formData: {
    type: Object,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:value'])

// 下拉选项(支持异步加载)
const selectOptions = ref(props.field.options || [])

// 异步加载选项
if (props.field.asyncOptions) {
  const { loader, dependencies } = props.field.asyncOptions
  
  // 监听依赖字段变化
  watch(
    () => dependencies.map(dep => props.formData[dep]),
    async (values) => {
      // 检查是否所有依赖都有值
      if (values.every(v => v != null)) {
        const depValues = dependencies.reduce((acc, dep, index) => {
          acc[dep] = values[index]
          return acc
        }, {})

        try {
          selectOptions.value = await loader(depValues)
        } catch (error) {
          console.error('加载选项失败', error)
        }
      }
    },
    { immediate: true }
  )
}

// 计算校验规则
const computedRules = computed(() => {
  if (!props.field.rules) return []

  return props.field.rules.map(rule => {
    if (typeof rule === 'string') {
      // 预设规则,如 'required', 'email'
      return getRulePreset(rule)
    }
    return rule
  })
})

// 预设规则
function getRulePreset(name) {
  const presets = {
    required: {
      required: true,
      message: `${props.field.label}不能为空`,
    },
    email: {
      type: 'email',
      message: '请输入正确的邮箱地址',
    },
    phone: {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
    },
    idCard: {
      pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
      message: '请输入正确的身份证号',
    },
  }
  return presets[name] || {}
}

// 值变化
function handleChange(value) {
  emit('update:value', value)
}
</script>

<style scoped></style>