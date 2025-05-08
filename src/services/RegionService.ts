import type { AxiosResponse } from 'axios'
import axiosInstance from '@/utils/axios'

export const regionService = {
    async getRegencies(): Promise<AxiosResponse<{ data: { id: number, name: string }[] }>> {
        try {
            const response = await axiosInstance.get('/v1/wilayah/kabupaten')
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data kabupaten.')
        }
    },
    async getDistricts(regency_id: string = ''): Promise<AxiosResponse<{ data: { id: number, name: string, regency_id: number }[] }>> {
        try {
            const response = await axiosInstance.get('/v1/wilayah/kecamatan', {
                params: {
                    regency_id,
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data kecamatan.')
        }
    },
    async getVillages(district_id: string = ''): Promise<AxiosResponse<{ data: { id: number, name: string, district_id: number }[] }>> {
        try {
            const response = await axiosInstance.get('/v1/wilayah/desa', {
                params: {
                    district_id,
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data desa.')
        }
    },
}