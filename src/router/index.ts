import { createRouter, createWebHistory } from 'vue-router'

const TableDrag = () => import('../views/table_drag.vue')
const UserList = () => import('../views/user_list.vue')
const FormExample = () => import('../views/form_example.vue')
const Test = () => import('../views/test.vue')
const Canvas = () => import('../views/canvas.vue')
const ShallowRef = () => import('../views/shallowRef.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/form_example'
    },
    {
      path: '/shallowRef',
      component: ShallowRef
    },
    {
      path: '/canvas',
      component: Canvas
    },
    {
      path: '/test',
      component: Test
    },
    {
      path: '/table_drag',
      component: TableDrag
    },
    {
      path: '/user_list',
      component: UserList
    },
    {
      path: '/form_example',
      component: FormExample
    }
  ]
})

export default router