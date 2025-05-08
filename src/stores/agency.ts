import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { agencyService } from '@/services/AgencyService'
import type { IncomingApiData } from '@/models/Agency'
import Agency from '@/models/Agency'

export const useAgencyStore = defineStore('agencies', () => {
    const agencies = ref<IncomingApiData[]>([])
    const pagination = ref<any | null>(null)
    const dashboard = ref<any | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const searchQuery = ref<string>('')
    const filterQuery = ref<string>('')

  // Kolom dinamis berdasarkan properti dari IncomingApiData
    const columns = computed(() => {
        if (!agencies.value.length) return []
        const sampleData = agencies.value[0]
        return Object.keys(sampleData).map((prop) => {
        if (prop === 'id') {
            return { prop, label: 'ID', width: 80, sortable: true, filterable: false }
        } else if (prop === 'created_at') {
            return { prop, label: 'Tanggal Dibuat', sortable: true, filterable: false }
        }
        return { 
            prop, 
            label: prop.charAt(0).toUpperCase() + prop.slice(1).replace(/_/g, ' '), 
            sortable: true, 
            filterable: true 
        }
        })
    })

    const fetchData = async (page: number = 1,per_page: number = 10, search: string = '', status: string = '', tingkatan: string = '') => {
        loading.value = true
        error.value = null
        try {
            const response = await agencyService.getAll(page, per_page, search, status, tingkatan)
            agencies.value = response.data.data
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

    const dashboardData = async (instansi_id: string = '') => {
            loading.value = true
            error.value = null
            
            try {
                const response = await agencyService.dashboard(instansi_id)
                dashboard.value = response.data.data
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
            const formData = new FormData()
            for (const key in data) {
                if (data[key] instanceof File) {
                    formData.append(key, data[key]) // Tambahkan file logo ke formData
                } else if (data[key] !== undefined) {
                    formData.append(key, data[key] as string) // Tambahkan field teks sebagai string
                }
            }
            const response = await agencyService.create(formData)
            agencies.value.unshift(response.data)
            await fetchData(pagination.value?.current_page || 1)
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat membuat instansi.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateData = async (id: number, data: any) => {
        loading.value = true
        try {
            const formData = new FormData()
            for (const key in data) {
                console.log(data[key]);
                
                if (data[key] === null) {
                    continue // Jika data[key] bernilai null, maka tidak akan dikirim ke database
                }
                
                if (key === 'logo' && typeof data[key] === 'string') {
                    // Skip if logo is a string (existing file path/URL)
                    continue
                }          
                
                if (data[key] instanceof File) {
                    formData.append(key, data[key]) // Tambahkan file logo baru ke formData
                } else if (data[key] !== undefined) {
                    formData.append(key, data[key]) // Tambahkan field teks sebagai string
                }
            }
            formData.append('_method', 'PUT')
            const response = await agencyService.update(id, formData)
            // const index = agencies.value.findIndex(agency => agency.id === id)
            // if (index !== -1) {
            //     agencies.value[index] = response.data // Perbarui store dengan data terbaru dari backend
            // }
            fetchData(pagination.value?.current_page || 1)
            return response.data
        } catch (err) {
            console.error('Gagal memperbarui instansi:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const showData = async (id: number) => {
        loading.value = true
        try {
            const response = await agencyService.show(id)
            return response.data
        } catch (err) {
            console.error('Gagal memuat detail instansi:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteMultipleData = async (ids: number[]) => {
        loading.value = true
        try {            
            await agencyService.deleteMultiple(ids); // Gunakan API multi-delete baru
            agencies.value = agencies.value.filter(agency => !ids.includes(agency.id)); // Perbarui store setelah delete
            await fetchData(pagination.value?.current_page || 1);
        } catch (err) {          
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteData = async (id: number) => {
            loading.value = true
            error.value = null
        try {
            await agencyService.delete(id)
            agencies.value = agencies.value.filter(i => i.id !== id)
            await fetchData(pagination.value?.current_page || 1)
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat menghapus instansi.'
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
        agencies,
        pagination,
        loading,
        error,
        dashboard,
        searchQuery,
        filterQuery,
        columns,
        fetchData,
        createData,
        dashboardData,
        deleteMultipleData,
        updateData,
        deleteData,
        showData,
        setSearchQuery,
        setFilterQuery,
    }
})