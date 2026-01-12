import { createRouter, createWebHistory } from 'vue-router'

const TableDrag = () => import('../views/table_drag.vue')
const UserList = () => import('../views/user_list.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/user_list'
    },
    {
      path: '/table_drag',
      component: TableDrag
    },
    {
      path: '/user_list',
      component: UserList
    }
  ]
})

export default router