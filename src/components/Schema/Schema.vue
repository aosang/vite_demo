<template>
  <div>
    <a-button 
      @click="handleClick"
      type="primary"
    >
      Click me
  </a-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { z } from 'zod'
  
const userSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  // 邮箱非必填，且校验邮箱格式
  email: z.email().optional(),
  // 手机号非必填，且校验手机号格式
  phone: z.string().regex(/^1[3-9]\d{9}$/).optional(),
})

const handleClick = () => {
  const result = userSchema.safeParse({
    username: 'admin',
    password: '',
    email: 'wangle2071@16.com',
    phone: '13800138000'
  })


  if (!result.success) {
    // key: 字段路径（如 "email" / "user.email"），value: 该字段所有错误信息
    const fieldErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path.join('.') || '(root)';(fieldErrors[field] ??= []).push(issue.message)
    }

    // 哪个字段有错就打印哪个字段
    for (const [field, messages] of Object.entries(fieldErrors)) {
      console.log(`${field} 校验失败：`, messages)
    }
  }
}
</script>