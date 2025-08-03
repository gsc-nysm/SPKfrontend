import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { logWeightingService } from '@/services/LogWeightingService'
import type { IncomingApiData } from '@/models/LogWeighting'
import LogWeighting from '@/models/LogWeighting'

export const useLogWeightingStore = defineStore('log_weighting', () => {
    const log_weighting = ref<IncomingApiData[]>([])
    const pagination = ref<any | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const searchQuery = ref<string>('')
    const filterQuery = ref<string>('')

    const fetchData = async (page: number = 1,per_page: number = 10, search: string = '', bantuan_sosial_id: string = '') => {
        loading.value = true
        error.value = null
        try {
            const response = await logWeightingService.getAll(page, per_page, search, bantuan_sosial_id)
            log_weighting.value = response.data.data
            pagination.value = {
                current_page: response.data.pagination.current_page,
                per_page: per_page, // Gunakan perPage yang dikirim, bukan dari response
                total: response.data.pagination.total,
            };
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat mengambil data instansi.'
        } finally {
            loading.value = false
        }
    }

    const createData = async (data: any) => {
        loading.value = true
        error.value = null
        try {
            const response = await logWeightingService.create(data)
            log_weighting.value.unshift(response.data)
            await fetchData(pagination.value?.current_page || 1)
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat membuat instansi.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const showData = async (id: number) => {
        loading.value = true
        try {
            const response = await logWeightingService.show(id)
            return response.data
        } catch (err) {
            console.error('Gagal memuat detail instansi:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const setSearchQuery = (query: string) => {
        searchQuery.value = query
        fetchData(1)
    }

    const setFilterQuery = (query: string) => {
        filterQuery.value = query
        fetchData(1)
    }

    return {
        log_weighting,
        pagination,
        loading,
        error,
        searchQuery,
        filterQuery,
        fetchData,
        createData,
        showData,
        setSearchQuery,
        setFilterQuery,
    }
})