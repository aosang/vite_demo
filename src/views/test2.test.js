import { mount } from '@vue/test-utils'
import Todo from '@/components/Todo/Todo.vue'

test('Todo', () => {
  const wrapper = mount(Todo)
  const todo = wrapper.get('[data-test="todo"]')
  expect(todo.text()).toBe('Learn Vue.js 3')
})
