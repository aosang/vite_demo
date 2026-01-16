<template>
  <div ref="elementRef">拖拽我</div>
</template>

<script setup>
import { useDraggable } from '@/utils/Draggable/useDraggable'

const { elementRef, isDragging } = useDraggable({
  onDragStart: (e) => {
    console.log('开始拖拽')
  },
  onDragMove: ({ x, y }) => {
    console.log('拖拽中', x, y)
  },
  onDragEnd: ({ x, y }) => {
    console.log('结束拖拽', x, y)
  }
})
</script>