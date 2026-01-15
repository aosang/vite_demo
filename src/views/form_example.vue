<template>
  <div class="form-example">
    <DynamicForm
      :schema="formSchema"
      :initial-values="initialValues"
      @submit="handleSubmit"
      />
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { message } from 'ant-design-vue'
import DynamicForm from '@/components/DynamicForm/DynamicForm.vue'

const formSchema = reactive({
  layout: 'vertical',
  fields: [
    {
      name: 'type',
      type: 'select',
      label: '类型',
      options: [
        { label: '个人', value: 'person' },
        { label: '企业', value: 'company' },
      ],
      rules: ['required'],
    },
    {
      name: 'idCard',
      type: 'input',
      label: '身份证号',
      visible: {
        $eq: ['type', 'person'],
      },
      dependencies: ['type'],
      rules: ['required', 'idCard'],
    },
    {
      name: 'businessLicense',
      type: 'input',
      label: '营业执照号',
      visible: {
        $eq: ['type', 'company'],
      },
      dependencies: ['type'],
      rules: ['required'],
    },
    {
      name: 'contacts',
      type: 'array',
      label: '联系人',
      max: 5,
      itemSchema: {
        fields: [
          {
            name: 'name',
            type: 'input',
            label: '姓名',
            rules: ['required'],
          },
          {
            name: 'phone',
            type: 'input',
            label: '电话',
            rules: ['required', 'phone'],
          },
        ],
      },
    },
  ],
})

const initialValues = {
  type: 'person',
  contacts: [],
}

function handleSubmit(values) {
  console.log('表单提交:', values)
  message.success('提交成功')
}
</script>

<style scoped>
  
</style>