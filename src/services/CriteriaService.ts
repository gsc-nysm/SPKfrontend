import type { AxiosResponse } from 'axios'
import axiosInstance from '@/utils/axios'
import type { IncomingApiData, OutgoingApiData } from '@/models/Criteria'
import Criteria from '@/models/Criteria'

export const criteriaService = {
    async getAll(page: number = 1, per_page: number = 10, search: string = '', bantuan_sosial_id: string = ''): Promise<AxiosResponse<{ data: IncomingApiData[]; pagination: any }>> {
        try {
            const response = await axiosInstance.get('/v1/kriteria-bantuan', {
                params: {
                    page,
                    per_page,
                    search,
                    bantuan_sosial_id,                    
                },
            })
            response.data.data = response.data.data.map((item:any) => Criteria.fromApiData(item))            
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data kriteria bantuan.')
        }
    },
    async create(formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post('/v1/kriteria-bantuan', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat kriteria bantuan.')
        }
    },

    async show(id: number): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.get(`/v1/kriteria-bantuan/${id}`)
            response.data.data = Criteria.fromApiData(response.data.data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil detail kriteria bantuan.')
        }
    },
    async update(id: number, formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post(`/v1/kriteria-bantuan/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memperbarui kriteria bantuan.')
        }
    },

    async updateBobot(id: number, formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post(`/v1/kriteria-bantuan/update-bobot/${id}?_method=PUT`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memperbarui kriteria bantuan.')
        }
    },

    async deleteMultiple(ids: number[]): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete('/v1/kriteria-bantuan', {
                data: { ids: ids.join(',')}, // Ubah array IDs menjadi string 1,2,3,... dan kirim dalam body request
                headers: {
                'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus kriteria bantuan terpilih.')
        }
    },

    async delete(id: number): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete(`/v1/kriteria-bantuan/${id}`)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus kriteria bantuan.')
        }
    },
}