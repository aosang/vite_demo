<!-- views/KanbanExample.vue -->
<template>
  <div class="kanban-example">
    <h2>看板示例</h2>

    <KanbanBoard
      :columns="columns"
      @card-move="handleCardMove"
    >
      <template #card="{ card }">
        <div class="custom-card">
          <div class="card-title">{{ card.title }}</div>
          <div class="card-desc">{{ card.description }}</div>
          <div class="card-footer">
            <span class="card-assignee">{{ card.assignee }}</span>
            <span class="card-date">{{ card.dueDate }}</span>
          </div>
        </div>
      </template>
    </KanbanBoard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import KanbanBoard from '@/components/DraggableList/KanbanBoard.vue'

const columns = ref([
  {
    id: 'todo',
    name: '待办',
    cards: [
      {
        id: '1',
        title: '设计首页原型',
        description: '完成首页的交互设计',
        assignee: '张三',
        dueDate: '2024-01-15',
      },
      {
        id: '2',
        title: '开发用户登录',
        description: '实现用户登录功能',
        assignee: '李四',
        dueDate: '2024-01-16',
      },
    ],
  },
  {
    id: 'doing',
    name: '进行中',
    cards: [
      {
        id: '3',
        title: '优化列表性能',
        description: '使用虚拟滚动优化',
        assignee: '王五',
        dueDate: '2024-01-17',
      },
    ],
  },
  {
    id: 'done',
    name: '已完成',
    cards: [
      {
        id: '4',
        title: '搭建项目框架',
        description: '完成项目初始化',
        assignee: '赵六',
        dueDate: '2024-01-10',
      },
    ],
  },
])

function handleCardMove(event) {
  const { card, fromColumn, fromIndex, toColumn, toIndex } = event

  // 从源列删除
  const sourceColumn = columns.value.find(col => col.id === fromColumn)
  if (sourceColumn) {
    sourceColumn.cards.splice(fromIndex, 1)
  }

  // 添加到目标列
  const targetColumn = columns.value.find(col => col.id === toColumn)
  if (targetColumn) {
    targetColumn.cards.splice(toIndex, 0, card)
  }

  message.success(`卡片 "${card.title}" 移动到 ${targetColumn.name}`)

  // 这里可以调用接口保存顺序
  // await updateCardPosition({ cardId: card.id, columnId: toColumn, order: toIndex })
}
</script>

<style scoped>
.kanban-example {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.custom-card {
  font-size: 14px;
}

.card-title {
  font-weight: 500;
  margin-bottom: 8px;
}

.card-desc {
  color: #666;
  margin-bottom: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}
</style>