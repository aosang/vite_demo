import { createRouter, createWebHistory } from 'vue-router'

const TableDrag = () => import('../views/table_drag.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/table_drag'
    },
    {
      path: '/table_drag',
      component: TableDrag
    }
  ]
})

export default router