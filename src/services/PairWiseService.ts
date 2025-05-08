import type { AxiosResponse } from 'axios'
import axiosInstance from '@/utils/axios'
import type { IncomingApiData, OutgoingApiData } from '@/models/PairWise'
import PairWise from '@/models/PairWise'

export const pariWiseService = {
    async getAll(page: number = 1, search: string = '', bantuan_sosial_id: string = ''): Promise<AxiosResponse<{ data: IncomingApiData[]; pagination: any }>> {
        try {
            const response = await axiosInstance.get('/v1/pair-wise-comparison', {
                params: {
                page,
                search,
                bantuan_sosial_id,
                },
            })
            response.data.data = response.data.data.map((item:any) => PairWise.fromApiData(item))
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data pair-wise-comparison.')
        }
    },
    async create(formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post('/v1/pair-wise-comparison', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat pair-wise-comparison.')
        }
    },

    async show(id: number): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.get(`/v1/pair-wise-comparison/${id}`)
            response.data.data = PairWise.fromApiData(response.data.data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil detail pair-wise-comparison.')
        }
    },
    async update(id: number, formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post(`/v1/pair-wise-comparison/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memperbarui pair-wise-comparison.')
        }
    },

    async deleteMultiple(ids: number[]): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete('/v1/pair-wise-comparison', {
                data: { ids: ids.join(',')}, // Ubah array IDs menjadi string 1,2,3,... dan kirim dalam body request
                headers: {
                'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus pair-wise-comparison terpilih.')
        }
    },

    async delete(id: number): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete(`/v1/pair-wise-comparison/${id}`)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus pair wise comparison.')
        }
    },

    async deleteByBantuan(id: string): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete(`/v1/pair-wise-comparison/delete-by-bantuan/${id}`)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus pair wise comparison.')
        }
    },
}