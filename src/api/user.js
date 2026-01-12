// 根据列名模拟一下数据
const mockData = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    age: 18,
    status: 'active',
    createdAt: '2024-01-01 12:00:00',
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    age: 22,
    status: 'inactive',
    createdAt: '2024-01-02 12:00:00',
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    age: 28,
    status: 'active',
    createdAt: '2024-01-03 12:00:00',
  },
  {
    id: 4,
    name: '赵六',
    email: 'zhaoliu@example.com',
    age: 32,
    status: 'inactive',
    createdAt: '2024-01-04 12:00:00',
  },
  {
    id: 5,
    name: '钱七',
    email: 'qianqi@example.com',
    age: 25,
    status: 'active',
    createdAt: '2024-01-05 12:00:00',
  },
]
// 模拟接口
export const getUserList = async (params) => {
  
  return new Promise((resolve) => {
    setTimeout(() => {
      let list = [...mockData]

      // 处理排序：默认按 id 升序
      const sortField = params.sortField || 'id'
      const sortOrder = params.sortOrder || 'ascend'

      list.sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        if (sortOrder === 'ascend') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })

      const current = params.current || 1
      const pageSize = params.pageSize || 10
      const start = (current - 1) * pageSize
      const end = start + pageSize
      const data = list.slice(start, end)
      
      resolve({
        data,
        total: mockData.length,
      })
    }, 500)
  })
}