import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/AuthService' // Impor service autentikasi
import type { IncomingUser } from '@/models/User'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: ref<IncomingUser | null>(null),
        token: localStorage.getItem('token') || null,
        isLoggedIn: false, // Default ke false sampai token divalidasi
    }),
    getters: {
        getIsLoggedIn: (state) => state.isLoggedIn,
    },
    actions: {
        async checkAuth() {
            const storedToken = localStorage.getItem('token')
            if (storedToken) {
                this.token = storedToken
                try {
                // Panggil endpoint backend untuk memverifikasi token
                const response = await authService.validateToken() // Tambahkan method ini di authService
                if (response.status === 200 && response.data.status) {                    
                    
                    this.user = response.data.data
                    this.isLoggedIn = response.data.status
                } else {
                    this.logout()
                }
                } catch (error) {
                console.error('Token validasi gagal:', error)
                this.logout()
                }
            } else {
                this.token = null
                this.isLoggedIn = false
            }
        },
        login(newToken: string) {
            this.token = newToken
            this.isLoggedIn = true
            localStorage.setItem('token', newToken)
        },
        logout() {            
            this.token = null
            this.isLoggedIn = false
            localStorage.removeItem('token')            
        },
    },
    persist: true, // Gunakan pinia-plugin-persistedstate jika diperlukan
})