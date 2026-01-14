<template>
  <div class="form-box">
    <div class="form-box-item">
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
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { checkFormValid } from '@/utils/testform'

const formData = reactive({
  username: '',
  company: '',
  password: ''
})
const errorMessage = ref('')


const handleInput = () => {
  const isValid = checkFormValid(formData)
  if (isValid !== true) {
    errorMessage.value = isValid
  } else {
    errorMessage.value = true
  }
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
</style>