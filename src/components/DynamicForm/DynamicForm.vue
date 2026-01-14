<template>
  <a-form
    ref="formRef"
    :model="formData"
    v-bind="$attrs"
  >
    <component />
  </a-form>
</template>

<script setup>
import { reactive, ref, computed, watch, provide } from 'vue'

const emit = defineEmits(['submit', 'change'])

const formRef = ref()
const submitting = ref(false)

// 表单数据
const formData = reactive({})

// 字段状态缓存
const fieldStates = reactive({})

</script>

<style scoped></style>