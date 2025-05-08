import type { AxiosResponse } from 'axios'
import axiosInstance from '@/utils/axios'
import type { IncomingApiData, OutgoingApiData } from '@/models/PotentialBeneficiary'
import PotentialBeneficiary from '@/models/PotentialBeneficiary'

export const potentialBeneficiaryService = {
    async getAll(page: number = 1, per_page: number = 10, search: string = '',bantuan_sosial_id: string = '', pengajuan_id: string = '', status: string = ''): Promise<AxiosResponse<{ data: IncomingApiData[]; pagination: any }>> {
        try {
            const response = await axiosInstance.get('/v1/calon-penerima', {
                params: {
                    page,
                    per_page,
                    search,
                    bantuan_sosial_id,
                    pengajuan_id,    
                    status                
                },
            })
            response.data.data = response.data.data.map((item:any) => PotentialBeneficiary.fromApiData(item))            
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data calon penerima bantuan.')
        }
    },

    async getRanking(search: string = '',pengajuan_id: string = '', status: string = ''): Promise<AxiosResponse<{ data: IncomingApiData[]; pagination: any }>> {
        try {
            const response = await axiosInstance.get('/v1/calon-penerima/peringkat', {
                params: {                   
                    search,                    
                    pengajuan_id,    
                    status                
                },
            })
            response.data.data = response.data.data.map((item:any) => PotentialBeneficiary.fromApiData(item))            
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil data calon penerima bantuan.')
        }
    },
    async create(formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post('/v1/calon-penerima', formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat calon penerima bantuan.')
        }
    },
    async calculateTopsis(formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            console.log(formData);
            
            const response = await axiosInstance.post('/v1/calon-penerima/calculate-topsis', formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat calon penerima bantuan.')
        }
    },

    async import(formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post('/v1/calon-penerima/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal membuat calon penerima bantuan.')
        }
    },

    async show(id: number): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.get(`/v1/calon-penerima/${id}`)
            response.data.data = PotentialBeneficiary.fromApiData(response.data.data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal mengambil detail calon penerima bantuan.')
        }
    },
    async update(id: number, formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.put(`/v1/calon-penerima/${id}`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memperbarui calon penerima bantuan.')
        }
    },

    async updateStatus(id: number, data: any): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.patch(`/v1/calon-penerima/update-status/${id}`, data)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memperbarui calon penerima bantuan.')
        }
    },

    async updateBobot(id: number, formData: FormData): Promise<AxiosResponse<IncomingApiData>> {
        try {
            const response = await axiosInstance.post(`/v1/calon-penerima/update-bobot/${id}?_method=PUT`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal memperbarui calon penerima bantuan.')
        }
    },

    async deleteMultiple(ids: number[]): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete('/v1/calon-penerima', {
                data: { ids: ids.join(',')}, // Ubah array IDs menjadi string 1,2,3,... dan kirim dalam body request
                headers: {
                'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus calon penerima bantuan terpilih.')
        }
    },

    async delete(id: number): Promise<AxiosResponse<void>> {
        try {
            const response = await axiosInstance.delete(`/v1/calon-penerima/${id}`)
            return response
        } catch (error) {
            throw error instanceof Error ? error : new Error('Gagal menghapus calon penerima bantuan.')
        }
    },
}