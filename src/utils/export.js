// components/ProTable/utils/export.js
import * as XLSX from 'xlsx'

// 导出表格数据为Excel
export function exportToExcel(columns, data, filename = 'export.xlsx') {
  // 构建表头
  const headers = columns
    .filter(col => !col.hideInExport && col.dataIndex && col.dataIndex !== 'action')
    .map(col => col.title)

  // 构建数据行
  const rows = data.map(record => {
    return columns
      .filter(col => !col.hideInExport && col.dataIndex && col.dataIndex !== 'action')
      .map(col => {
        const value = record[col.dataIndex]

        // 格式化值
        if (col.customRender) {
          // 如果有自定义渲染，尝试提取纯文本
          return extractText(col.customRender({ text: value, record }))
        }

        // 根据valueType格式化
        if (col.valueType) {
          return formatValueByType(value, col.valueType, col.valueEnum)
        }

        return value
      })
  })

  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // 设置列宽
  worksheet['!cols'] = columns
    .filter(col => !col.hideInExport)
    .map(col => ({ wch: col.width ? col.width / 10 : 15 }))

  // 创建工作簿
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  // 导出文件
  XLSX.writeFile(workbook, filename)
}

// 从 VNode 提取纯文本
function extractText(vnode) {
  if (!vnode) return ''
  if (typeof vnode === 'string') return vnode
  if (typeof vnode === 'number') return String(vnode)
  if (Array.isArray(vnode)) {
    return vnode.map(extractText).join('')
  }
  if (vnode.children) {
    if (typeof vnode.children === 'string') return vnode.children
    if (Array.isArray(vnode.children)) {
      return vnode.children.map(extractText).join('')
    }
  }
  return ''
}

// 根据类型格式化值
function formatValueByType(value, valueType, valueEnum) {
  if (value == null) return ''

  switch (valueType) {
    case 'date':
      return new Date(value).toLocaleDateString('zh-CN')

    case 'dateTime':
      return new Date(value).toLocaleString('zh-CN')

    case 'money':
      return `¥${Number(value).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`

    case 'percent':
      return `${(Number(value) * 100).toFixed(2)}%`

    case 'enum':
      if (valueEnum && valueEnum[value]) {
        return valueEnum[value].text || value
      }
      return value

    default:
      return value

  }
}