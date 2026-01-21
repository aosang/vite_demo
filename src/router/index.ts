import { createRouter, createWebHistory } from 'vue-router'

const TableDrag = () => import('../views/table_drag.vue')
const UserList = () => import('../views/user_list.vue')
const FormExample = () => import('../views/form_example.vue')
const Test = () => import('../views/test.vue')
const Canvas = () => import('../views/canvas.vue')
const ShallowRef = () => import('../views/shallowRef.vue')
const VirtualList = () => import('../views/virtual_list.vue')
const Kanban = () => import('../views/kanban.vue')
const Draggable = () => import('../views/draggable.vue')
const WhiteBoard = () => import('../views/whitboard_canvas.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/whitboard_canvas'
    },
    {
      path: '/whitboard_canvas',
      component: WhiteBoard
    },
    {
      path: '/draggable',
      component: Draggable
    },
    {
      path: '/kanban',
      component: Kanban
    },
    {
      path: '/virtual_list',
      component: VirtualList
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