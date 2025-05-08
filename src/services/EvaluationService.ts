import type { AxiosResponse } from 'axios'
import axiosInstance from '@/utils/axios'
import type { IncomingApiData, OutgoingApiData } from '@/models/Evaluation'
import Evaluation from '@/models/Evaluation'

export const evalutionService = {
    async getAll(page: number = 1, per_page: number = 10, search: string = '', calon_penerima_id: string = '', sub_kriteria_bantuan_id: string = ''): Promise<AxiosResponse<{ data: IncomingApiData[]; pagination: any }>> {
        try {
            const response = await axiosInstance.get('/v1/penilaian', {
                params: {
                    page,
                    per_page,
                    search,
                    calon_penerima_id,
                    sub_kriteria_bantuan_id,
                },
            })
            response.data.data = response.data.data.map((item:any) => Evaluation.fromApiData(item))
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data penilaian.')
        }
    },
    async create(formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post('/v1/penilaian', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat penilaian.')
        }
    },

    async show(id: number): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.get(`/v1/penilaian/${id}`)
            response.data.data = Evaluation.fromApiData(response.data.data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil detail penilaian.')
        }
    },
    async update(id: number, formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post(`/v1/penilaian/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memperbarui penilaian.')
        }
    },

    async deleteMultiple(ids: number[]): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete('/v1/penilaian', {
                data: { ids: ids.join(',')}, // Ubah array IDs menjadi string 1,2,3,... dan kirim dalam body request
                headers: {
                'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus penilaian terpilih.')
        }
    },

    async delete(id: number): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete(`/v1/penilaian/${id}`)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus penilaian.')
        }
    },
}