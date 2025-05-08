import type { AxiosResponse } from 'axios'
import axiosInstance from '@/utils/axios'
import type { IncomingApiData, OutgoingApiData } from '@/models/UserAgency'
import UserAgency from '@/models/UserAgency'

export const userAgencyService = {
    async getAll(page: number = 1,per_page: number = 10, search: string = '', bidang_instansi_id: string = '', instansi_id: string = ''): Promise<AxiosResponse<{ data: IncomingApiData[]; pagination: any }>> {
        try {
            const response = await axiosInstance.get('/v1/anggota-instansi', {
                params: {
                    page,
                    per_page,
                    search,
                    bidang_instansi_id,
                    instansi_id,
                },
            })
            response.data.data = response.data.data.map((item:any) => UserAgency.fromApiData(item))            
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data instansi.')
        }
    },
    async create(formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post('/v1/anggota-instansi', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat instansi.')
        }
    },

    async show(id: number): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.get(`/v1/anggota-instansi/${id}`)
            response.data.data = UserAgency.fromApiData(response.data.data)
            return response.data
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil detail instansi.')
        }
    },
    async update(id: number, formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post(`/v1/anggota-instansi/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memperbarui instansi.')
        }
    },
    async updateProfile(id: number, data: any): Promise<AxiosResponse<IncomingApiData>> {
        try {            
            const response = await axiosInstance.post(`/v1/anggota-instansi/update-profil/${id}`, data, 
                {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memperbarui instansi.')
        }
    },

    async deleteMultiple(ids: number[]): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete('/v1/anggota-instansi', {
                data: { ids: ids.join(',')}, // Ubah array IDs menjadi string 1,2,3,... dan kirim dalam body request
                headers: {
                'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus instansi terpilih.')
        }
    },

    async delete(id: number): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete(`/v1/anggota-instansi/${id}`)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus instansi.')
        }
    },
}