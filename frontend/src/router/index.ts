// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
// Using 'import type' prevents the SyntaxError in Vite
import type { RouteRecordRaw } from 'vue-router';

// Import your components
import LoginView from '../components/LoginView.vue';
import HomeView from '../components/HomeView.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
    },
    {
        path: '/',
        name: 'Home',
        component: HomeView,
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        // We can reuse HomeView for now or create a separate DashboardView later
        component: HomeView,
    },
    {
        path: '/members',
        name: 'MemberList',
        // This will be for your "Member List" page
        component: () => import('../components/MemberListView.vue'),
    },
    {
        path: '/members/add',
        name: 'AddMember',
        component: () => import('../components/MemberFormView.vue'),
    },
    {
        path: '/members/:id', // :id is a dynamic parameter
        name: 'MemberDetail',
        component: () => import('../components/MemberDetailView.vue')
    },
    {
        path: '/members/edit/:id', // Reuse the form component
        name: 'EditMember',
        component: () => import('../components/MemberFormView.vue')
    },
    {
        path: '/export',
        name: 'MemberExport',
        component: () => import('../components/MemberExportView.vue')
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('../components/SettingsView.vue')
    },
];


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;