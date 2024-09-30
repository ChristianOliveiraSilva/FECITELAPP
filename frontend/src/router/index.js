import { createRouter, createWebHistory } from 'vue-router'
import NotFoundView from '../views/404View.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/list',
      name: 'list',
      component: () => import('../views/ListView.vue')
    },
    {
      path: '/questionnaire/:assessmentId',
      name: 'questionnaire',
      component: () => import('../views/QuestionnaireView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
    },
  ]
})

function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

router.beforeEach((to, from, next) => {
  const isLoggedIn = isAuthenticated();

  if (!isLoggedIn && to.name !== 'login') {
    next({ name: 'login' });
  } else if (isLoggedIn && (to.name === 'login' || to.name === 'home')) {
    next({ name: 'list' });
  } else {
    next();
  }
});

export default router
