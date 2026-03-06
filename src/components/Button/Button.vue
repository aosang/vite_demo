<template>
  <button 
    :class="['button', type, size, plain && 'plain', plain && type]" 
    :disabled="disabled"
    @click="handleClick"
  >
    <span class="button-inner">
      <!-- 图标：优先用插槽，否则用 icon 属性（Iconify 图标名） -->
      <span
        v-if="$slots.icon || icon"
        class="button-icon"
        :style="iconSize ? { fontSize: typeof iconSize === 'number' ? `${iconSize}px` : iconSize } : undefined"
      >
        <slot name="icon">
          <Icon v-if="icon" :icon="icon" />
        </slot>
      </span>
      <!-- 文字：默认插槽，没传则用 text 属性 -->
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<script setup>
import { Icon } from '@iconify/vue'

const emit = defineEmits(['click'])

const props = defineProps({
  /** 按钮文字（无默认插槽时使用） */
  text: {
    type: String,
    default: 'Click me',
  },
  /** Iconify 图标名，如 mdi:magnify、carbon:search */
  icon: {
    type: String,
    default: '',
  },
  /** 图标尺寸：不传则随按钮 size；可传数字(px) 或字符串如 '18px'、'1.2em' */
  iconSize: {
    type: [Number, String],
    default: undefined,
  },

  type: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger'].includes(value),
  },

  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },

  plain: {
    type: Boolean,
    default: false,
  },

  disabled: {
    type: Boolean,
    default: false,
  },
})

const handleClick = (e) => {
  if (!props.disabled) emit('click', e)
}
</script>

<style scoped lang="scss">
.button {
  appearance: none;
  outline: none;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.button-inner {
  display: inline-flex;
  align-items: center;
}

.button-icon {
  display: inline-flex;
  align-items: center;
  line-height: 1;
  font-size: 1em; /* 默认随按钮 font-size（small/medium/large） */
}

.button-icon :deep(svg) {
  display: block;
}

.primary {
  background-color: #1890ff;
  color: white;
}

.primary:hover {
  background-color: #40a9ff;
}

.success {
  background-color: #52c41a;
  color: white;
}

.success:hover {
  background-color: #85ce61;
}

.warning {
  background-color: #faad14;
  color: white;
}

.warning:hover {
  background-color: #fdd835;
}

.danger {
  background-color: #f5222d;
  color: white;
}

.danger:hover {
  background-color: #ff4d4f;
}

/* size */
.small {  
  padding: 4px 8px;
  font-size: 12px;
}

.medium {
  padding: 8px 14px;
  font-size: 14px;
}

.large {
  padding: 12px 20px;
  font-size: 16px;
}

/* plain */
.plain {
  background-color: transparent;
  color: #1890ff;
  border: 1px solid #1890ff;
}

.plain:hover {
  background-color: #40a9ff;
  color: white;
  border-color: #40a9ff;
}

.plain.success {
  border-color: #52c41a;
  color: #52c41a;
}

.plain.success:hover {
  background-color: #85ce61;
  color: white;
  border-color: #85ce61;
}

.plain.warning {
  border-color: #faad14;
  color: #faad14;
}

.plain.warning:hover {
  background-color: #fdd835;
  color: white;
  border-color: #fdd835;
}

.plain.danger {
  border-color: #f5222d;
  color: #f5222d;
}

.plain.danger:hover {
  background-color: #ff4d4f;
  color: white;
  border-color: #ff4d4f;
}
</style>