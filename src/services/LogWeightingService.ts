import type { AxiosResponse } from 'axios'
import axiosInstance from '@/utils/axios'
import type { IncomingApiData, OutgoingApiData } from '@/models/LogWeighting'
import LogWeighting from '@/models/LogWeighting'

export const logWeightingService = {
    async getAll(page: number = 1, per_page: number = 10, search: string = '', bantuan_sosial_id: string = ''): Promise<AxiosResponse<{ data: IncomingApiData[]; pagination: any }>> {
        try {
            const response = await axiosInstance.get('/v1/log-pembobotan', {
                params: {
                    page,
                    per_page,
                    search,
                    bantuan_sosial_id
                },
            })
            response.data.data = response.data.data.map((item:any) => LogWeighting.fromApiData(item))
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data log-pembobotan.')
        }
    },
    async create(formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post('/v1/log-pembobotan', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat log-pembobotan.')
        }
    },

    async show(id: number): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.get(`/v1/log-pembobotan/${id}`)
            response.data.data = LogWeighting.fromApiData(response.data.data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil detail log-pembobotan.')
        }
    },
}