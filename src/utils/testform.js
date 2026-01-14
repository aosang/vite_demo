export const checkFormValid = (form) => {
  // 遍历对象
  for (const key in form) { 
    if (!form[key]) {
      // ${key} 返回中文
      return `${key.replace('username', '用户名').replace('company', '公司名').replace('password', '密码')}不能为空`
    }
  }
  return true
}