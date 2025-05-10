import type { AxiosResponse } from 'axios'
import axiosInstance from '@/utils/axios'
import type { RegisterForm } from '@/types/registerForm'
import { useAuthStore } from '@/stores/auth'

interface TokenValidationResponse {
    status: boolean
    message: string
    code: number
}

export const authService = {
    /**
     * Mengirim data registrasi ke API
     * @param formData Data form registrasi
     * @returns Promise dengan respons dari API
     */
    async register(formData: RegisterForm): Promise<AxiosResponse> {
        try {            
            const response = await axiosInstance.post('/v1/auth/register', formData)
            return response
        } catch (error) {
            // Hanya lempar error ke interceptor axios, jangan tangani notifikasi di sini
            throw error instanceof Error ? error : new Error('Terjadi kesalahan tidak terduga.')
        }
    },

    async changePassword(data: any): Promise<AxiosResponse> {
        try {            
            const response = await axiosInstance.post('/v1/auth/ganti-password', data)
            return response
        } catch (error) {
            // Hanya lempar error ke interceptor axios, jangan tangani notifikasi di sini
            throw error instanceof Error ? error : new Error('Terjadi kesalahan tidak terduga.')
        }
    },

    async validateToken(): Promise<AxiosResponse> {
        try {
            const response = await axiosInstance.get('/v1/auth/me') // Sesuaikan endpoint
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memverifikasi token.')
        }
    },

    async login(email: string, password: string): Promise<AxiosResponse> {
        try {
            const response = await axiosInstance.post('/v1/auth/login', {
                email,
                password,
            })
            
            const authStore = useAuthStore()
            const token = response.data.data.token // Sesuaikan dengan respons API
            authStore.login(token) // Simpan token di store Pinia
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Terjadi kesalahan tidak terduga.')
        }
    },
    

    // Tambahkan fungsi logout di sini
    async logout(): Promise<void> {
        try {
            const authStore = useAuthStore()
            await axiosInstance.post('v1/auth/logout')
            authStore.logout()
        } catch (error) {
            throw error instanceof Error ? error : new Error('Terjadi kesalahan tidak terduga.')
        }
    }
    
}