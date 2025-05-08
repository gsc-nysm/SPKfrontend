import type { AxiosResponse } from 'axios'
import axiosInstance from '@/utils/axios'
import type { IncomingApiData, OutgoingApiData } from '@/models/RegistrationPeriod'
import RegistrationPeriod from '@/models/RegistrationPeriod'

export const registrationPeriodService = {
    async getAll(page: number = 1,per_page: number = 10, search: string = '', bantuan_sosial_id: string = '', status: string = 'all'): Promise<AxiosResponse<{ data: IncomingApiData[]; pagination: any }>> {
        try {
            const response = await axiosInstance.get('/v1/periode-pendaftaran', {
                params: {
                    page,
                    per_page,
                    search,
                    bantuan_sosial_id,          
                    status,          
                },
            })
            response.data.data = response.data.data.map((item:any) => RegistrationPeriod.fromApiData(item))            
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data periode pendaftaran.')
        }
    },
    async create(formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post('/v1/periode-pendaftaran', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat periode pendaftaran.')
        }
    },

    async show(id: number): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.get(`/v1/periode-pendaftaran/${id}`)
            
            response.data.data = RegistrationPeriod.fromApiData(response.data.data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil detail periode pendaftaran.')
        }
    },
    async update(id: number, formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post(`/v1/periode-pendaftaran/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memperbarui periode pendaftaran.')
        }
    },

    async deleteMultiple(ids: number[]): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete('/v1/periode-pendaftaran', {
                data: { ids: ids.join(',')}, // Ubah array IDs menjadi string 1,2,3,... dan kirim dalam body request
                headers: {
                'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus periode pendaftaran terpilih.')
        }
    },

    async delete(id: number): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete(`/v1/periode-pendaftaran/${id}`)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus periode pendaftaran.')
        }
    },
}