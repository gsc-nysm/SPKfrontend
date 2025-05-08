import type { AxiosResponse } from 'axios'
import axiosInstance from '@/utils/axios'
import type { IncomingApiData, OutgoingApiData } from '@/models/Agency'
import Agency from '@/models/Agency'

export const agencyService = {
    async getAll(page: number = 1, per_page: number = 10, search: string = '', status: string = '', tingkatan: string = ''): Promise<AxiosResponse<{ data: IncomingApiData[]; pagination: any }>> {
        try {
            const response = await axiosInstance.get('/v1/instansi', {
                params: {
                    page,
                    per_page,
                    search,
                    status,
                    tingkatan,
                },
            })
            response.data.data = response.data.data.map((item:any) => Agency.fromApiData(item))
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data instansi.')
        }
    },
    async create(formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post('/v1/instansi', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat instansi.')
        }
    },

    async dashboard(instansi_id: string = '') {
        try {
            const response = await axiosInstance.get('/v1/instansi/dashboard', {
                params: {
                    instansi_id,
                },
            })
            response.data.data = response.data.data
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data bantuan.')
        }
    },

    async show(id: number): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.get(`/v1/instansi/${id}`)
            response.data.data = Agency.fromApiData(response.data.data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil detail instansi.')
        }
    },
    async update(id: number, formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post(`/v1/instansi/${id}`, formData, {
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
            const response = await axiosInstance.delete('/v1/instansi', {
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
            const response = await axiosInstance.delete(`/v1/instansi/${id}`)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus instansi.')
        }
    },
}