# 虚拟滚动组件使用说明

## 问题修复总结

### 问题 1：文本重叠和列表消失

**原因分析：**
1. **ResizeObserver 索引错误**：使用 `dataset.index` 存储索引，当 DOM 元素被虚拟滚动重用时，索引值还是旧的，导致更新了错误位置的高度缓存
2. **高度更新策略问题**：累计误差导致偏移量计算不准确
3. **观察器未正确清理**：元素移除时没有取消 ResizeObserver 观察

**解决方案：**
1. 使用 `WeakMap` 存储元素与索引的映射，避免 DOM 重用问题
2. 高度更新后清空后续的偏移量缓存，强制重新计算，避免累计误差
3. 在元素更新和移除时正确管理 ResizeObserver
4. 使用 `requestAnimationFrame` 延迟测量高度，确保 DOM 已渲染

## 组件说明

### 1. VirtualList.vue（基础虚拟列表 - 已修复）

**功能：**
- 支持大量数据（1000+）的高性能渲染
- 支持动态高度（自动测量每项的实际高度）
- 二分查找优化滚动性能

**Props：**
- `items`: 数据数组
- `height`: 容器高度（必需）
- `estimatedItemHeight`: 预估项高度（默认 50px）
- `overscan`: 缓冲区项数（默认 5）
- `itemKey`: 获取项唯一 key 的字段名或函数

**使用示例：**
```vue
<VirtualList
  :items="items"
  :height="600"
  :estimated-item-height="80"
  item-key="id"
>
  <template #default="{ item, index }">
    <div class="list-item">
      <div>{{ item.title }}</div>
      <div>{{ item.description }}</div>
    </div>
  </template>
</VirtualList>
```

### 2. VirtualListWithInfinite.vue（无限加载虚拟列表）

**功能：**
- 包含基础虚拟列表的所有功能
- 滚动到底部自动触发加载更多
- 显示加载状态和"没有更多"提示

**额外 Props：**
- `loadMore`: 加载更多的异步函数
- `hasMore`: 是否还有更多数据
- `threshold`: 距离底部多远触发加载（默认 200px）

**使用示例：**
```vue
<script setup>
import { ref } from 'vue'
import VirtualListWithInfinite from '@/components/VirtualTable/VirtualListWithInfinite.vue'

const items = ref([])
const hasMore = ref(true)
const page = ref(1)

// 加载更多数据
async function loadMore() {
  const response = await fetch(`/api/items?page=${page.value}`)
  const data = await response.json()
  
  items.value = [...items.value, ...data.items]
  page.value++
  
  if (data.items.length === 0) {
    hasMore.value = false
  }
}

// 初始化
loadMore()
</script>

<template>
  <VirtualListWithInfinite
    :items="items"
    :height="600"
    :estimated-item-height="80"
    item-key="id"
    :load-more="loadMore"
    :has-more="hasMore"
  >
    <template #default="{ item, index }">
      <div class="list-item">
        {{ item.title }}
      </div>
    </template>
  </VirtualListWithInfinite>
</template>
```

### 3. VirtualTableWithInfinite.vue（无限加载虚拟表格）

**功能：**
- 表格形式展示数据
- 支持虚拟滚动
- 支持无限加载
- 支持自定义列和单元格插槽

**Props：**
- `columns`: 列配置数组
- `data`: 数据数组
- `height`: 表格高度
- `rowHeight`: 行高（默认 50px）
- `rowKey`: 行唯一 key
- `loadMore`: 加载更多函数
- `hasMore`: 是否还有更多数据
- `threshold`: 距离底部多远触发加载（默认 200px）

**列配置：**
```javascript
const columns = [
  {
    key: 'id',           // 唯一标识
    title: 'ID',         // 列标题
    dataIndex: 'id',     // 数据字段
    width: 80,           // 固定宽度
    minWidth: 100,       // 最小宽度
  }
]
```

**使用示例：**
```vue
<script setup>
import { ref } from 'vue'
import VirtualTableWithInfinite from '@/components/VirtualTable/VirtualTableWithInfinite.vue'

const columns = [
  { key: 'id', title: 'ID', dataIndex: 'id', width: 80 },
  { key: 'name', title: '姓名', dataIndex: 'name', width: 120 },
  { key: 'email', title: '邮箱', dataIndex: 'email', width: 200 },
  { key: 'action', title: '操作', dataIndex: 'action', width: 100 },
]

const data = ref([])
const hasMore = ref(true)

async function loadMore() {
  // 加载数据逻辑
}
</script>

<template>
  <VirtualTableWithInfinite
    :columns="columns"
    :data="data"
    :height="600"
    :row-height="50"
    row-key="id"
    :load-more="loadMore"
    :has-more="hasMore"
  >
    <!-- 自定义单元格 -->
    <template #cell-action="{ row }">
      <button @click="handleEdit(row)">编辑</button>
    </template>
  </VirtualTableWithInfinite>
</template>
```

## 性能优化技巧

### 1. 合理设置预估高度
将 `estimatedItemHeight` 设置为接近实际平均高度的值，可以减少初始渲染时的布局抖动。

### 2. 使用稳定的 key
确保 `itemKey` 或 `rowKey` 返回稳定且唯一的值，避免不必要的 DOM 重新创建。

### 3. 优化插槽内容
避免在插槽中进行复杂计算，使用 `computed` 预处理数据。

### 4. 调整缓冲区大小
根据实际情况调整 `overscan` 值：
- 较小的值（3-5）：节省内存，适合简单项
- 较大的值（8-10）：更流畅的滚动体验，适合复杂项

### 5. 加载策略
- 设置合适的 `threshold` 值（建议 200-500px）
- 控制每次加载的数据量（建议 20-50 条）
- 在 `loadMore` 中添加防抖逻辑

## 常见问题

### Q1: 为什么初始渲染时有些项会闪烁？
A: 这是因为预估高度与实际高度不一致。解决方法：
- 设置更准确的 `estimatedItemHeight`
- 使用 `requestAnimationFrame` 延迟测量（已在修复版本中实现）

### Q2: 快速滚动时为什么会有空白？
A: 可能是缓冲区太小。尝试增加 `overscan` 的值。

### Q3: 如何重置列表状态？
A: 使用组件暴露的 `reset()` 方法：
```javascript
const listRef = ref()
listRef.value?.reset()
```

### Q4: 支持横向虚拟滚动吗？
A: 当前版本只支持纵向滚动。如需横向滚动，可以参考代码进行类似实现。

## 测试建议

1. **测试大数据量**：至少测试 1000 条数据
2. **测试动态高度**：包含不同高度的项
3. **测试快速滚动**：快速滚动到底部和顶部
4. **测试加载更多**：验证数据正确追加
5. **测试边界情况**：空数据、单条数据、加载失败等

## 浏览器兼容性

- Chrome 64+
- Firefox 69+
- Safari 12.1+
- Edge 79+

主要依赖特性：
- ResizeObserver
- WeakMap
- requestAnimationFrame
- IntersectionObserver（仅无限加载功能）

## 更新日志

### v1.1.0 (2026-01-16)
- 🐛 修复：文本重叠问题
- 🐛 修复：快速滚动时列表消失问题
- 🐛 修复：ResizeObserver 索引错误
- ✨ 新增：VirtualListWithInfinite 组件
- ✨ 新增：VirtualTableWithInfinite 组件
- 📝 完善：组件文档和使用示例

### v1.0.0
- ✨ 初始版本：基础 VirtualList 和 VirtualTable 组件
