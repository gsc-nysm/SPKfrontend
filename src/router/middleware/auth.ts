import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const requireAuth = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
    ) => {
        const authStore = useAuthStore()
        if (!authStore.getIsLoggedIn) {
            next({ name: 'login', query: { redirect: to.fullPath } })
        } else {
            next()
        }
}