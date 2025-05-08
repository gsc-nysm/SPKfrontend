import type { AxiosResponse } from 'axios'
import axiosInstance from '@/utils/axios'
import type { IncomingApiData, OutgoingApiData } from '@/models/Beneficiary'
import Beneficiary from '@/models/Beneficiary'

export const beneficiaryService = {
    async getAll(page: number = 1, per_page: number = 10, search: string = '', kelompok_penerima_id: string = '', calon_penerima_id:string = '', status:string = ''): Promise<AxiosResponse<{ data: IncomingApiData[]; pagination: any }>> {
        try {
            const response = await axiosInstance.get('/v1/penerima-bantuan', {
                params: {
                    page,
                    per_page,
                    search,
                    kelompok_penerima_id,     
                    calon_penerima_id,
                    status
                },
            })
            response.data.data = response.data.data.map((item:any) => Beneficiary.fromApiData(item))            
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data kriteria bantuan.')
        }
    },
    async create(data:any): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post('/v1/penerima-bantuan', data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat kriteria bantuan.')
        }
    },

    async multiCreate(data:any): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post('/v1/penerima-bantuan/multi-store', data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat kriteria bantuan.')
        }
    },

    async show(id: number): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.get(`/v1/penerima-bantuan/${id}`)
            response.data.data = Beneficiary.fromApiData(response.data.data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil detail kriteria bantuan.')
        }
    },
    async update(id: number, data: any): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post(`/v1/penerima-bantuan/${id}`, data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memperbarui kriteria bantuan.')
        }
    },

    async deleteMultiple(ids: number[]): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete('/v1/penerima-bantuan', {
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
            const response = await axiosInstance.delete(`/v1/penerima-bantuan/${id}`)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus kriteria bantuan.')
        }
    },
}