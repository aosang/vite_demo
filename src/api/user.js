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
  {
    id: 6,
    name: '孙八',
    email: 'sunba@example.com',
    age: 29,
    status: 'inactive',
    createdAt: '2024-01-06 12:00:00',
  },
  {
    id: 7,
    name: '周九',
    email: 'zhoujiu@example.com',
    age: 33,
    status: 'active',
    createdAt: '2024-01-07 12:00:00',
  },
  {
    id: 8,
    name: '吴十',
    email: 'wushi@example.com',
    age: 35,
    status: 'inactive',
    createdAt: '2024-01-08 12:00:00',
  },
  {
    id: 9,
    name: '郑十一',
    email: 'zhengshi@example.com',
    age: 38,
    status: 'active',
    createdAt: '2024-01-09 12:00:00',
  },
  {
    id: 10,
    name: '王十二',
    email: 'wangshi@example.com',
    age: 40,
    status: 'inactive',
    createdAt: '2024-01-10 12:00:00',
  },
  {
    id: 11,
    name: '冯十三',
    email: 'fengshi@example.com',
    age: 42,
    status: 'active',
    createdAt: '2024-01-11 12:00:00',
  },
  {
    id: 12,
    name: '陈十四',
    email: 'chenshi@example.com',
    age: 44,
    status: 'inactive',
    createdAt: '2024-01-12 12:00:00',
  }
]
// 模拟接口
export const getUserList = async (params) => {
  
  return new Promise((resolve) => {
    setTimeout(() => {
      let list = [...mockData]

      // 1. 处理筛选 (新增逻辑)
      if (params.status && params.status.length > 0) {
        list = list.filter(item => params.status.includes(item.status))
      }

      // 2. 处理排序：默认按 id 升序
      const sortField = params.sortField || 'id'
      const sortOrder = params.sortOrder || 'ascend'

      list.sort((a, b) => {
        let aVal = a[sortField]
        let bVal = b[sortField]

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'ascend' ? aVal - bVal : bVal - aVal
        }

        aVal = String(aVal)
        bVal = String(bVal)
        return sortOrder === 'ascend' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal)
      })

      // 3. 处理分页
      const current = params.current || 1
      const pageSize = params.pageSize || 10
      const start = (current - 1) * pageSize
      const end = start + pageSize
      const data = list.slice(start, end)
      
      resolve({
        data,
        total: list.length, // 注意这里要返回过滤后的总数
      })
    }, 500)
  })
}