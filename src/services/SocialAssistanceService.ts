import type { AxiosResponse } from 'axios'
import axiosInstance from '@/utils/axios'
import type { IncomingApiData, OutgoingApiData } from '@/models/SocialAssistance'
import SocialAssistance from '@/models/SocialAssistance'

export const socialAssistanceService = {
    async getAll(page: number = 1, search: string = '', bidang_instansi_id: string = ''): Promise<AxiosResponse<{ data: IncomingApiData[]; pagination: any }>> {
        try {
            const response = await axiosInstance.get('/v1/bantuan-sosial', {
                params: {
                    page,
                    search,
                    bidang_instansi_id,                    
                },
            })
            response.data.data = response.data.data.map((item:any) => SocialAssistance.fromApiData(item))            
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data bantuan.')
        }
    },

    async dashboard(bantuan_sosial_id: string = '') {
        try {
            const response = await axiosInstance.get('/v1/bantuan-sosial/dashboard', {
                params: {
                    bantuan_sosial_id,
                },
            })
            response.data.data = response.data.data
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data bantuan.')
        }
    },
    async create(formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post('/v1/bantuan-sosial', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat bantuan.')
        }
    },

    async show(id: number): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.get(`/v1/bantuan-sosial/${id}`)
            response.data.data = SocialAssistance.fromApiData(response.data.data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil detail bantuan.')
        }
    },
    async update(id: number, formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post(`/v1/bantuan-sosial/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memperbarui bantuan.')
        }
    },

    async deleteMultiple(ids: number[]): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete('/v1/bantuan-sosial', {
                data: { ids: ids.join(',')}, // Ubah array IDs menjadi string 1,2,3,... dan kirim dalam body request
                headers: {
                'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus bantuan terpilih.')
        }
    },

    async delete(id: number): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete(`/v1/bantuan-sosial/${id}`)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus bantuan.')
        }
    },
}