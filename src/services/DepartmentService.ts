import type { AxiosResponse } from 'axios'
import axiosInstance from '@/utils/axios'
import type { IncomingApiData, OutgoingApiData } from '@/models/Department'
import Department from '@/models/Department'

export const departmentService = {
    async getAll(page: number = 1,per_page: number = 10, search: string = '', instansi_id: string = ''): Promise<AxiosResponse<{ data: IncomingApiData[]; pagination: any }>> {
        try {
            const response = await axiosInstance.get('/v1/bidang-instansi', {
                params: {
                    page,
                    per_page,
                    search,
                    instansi_id,                
                },
            })
            response.data.data = response.data.data.map((item:any) => Department.fromApiData(item))
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data bidang-instansi.')
        }
    },
    async create(formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post('/v1/bidang-instansi', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat bidang-instansi.')
        }
    },

    async show(id: number): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.get(`/v1/bidang-instansi/${id}`)
            response.data.data = Department.fromApiData(response.data.data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil detail bidang-instansi.')
        }
    },
    async update(id: number, formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post(`/v1/bidang-instansi/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memperbarui bidang-instansi.')
        }
    },

    async deleteMultiple(ids: number[]): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete('/v1/bidang-instansi', {
                data: { ids: ids.join(',')}, // Ubah array IDs menjadi string 1,2,3,... dan kirim dalam body request
                headers: {
                'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus bidang-instansi terpilih.')
        }
    },

    async delete(id: number): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete(`/v1/bidang-instansi/${id}`)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus bidang-instansi.')
        }
    },
}