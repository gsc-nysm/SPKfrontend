import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { socialAssistanceService } from '@/services/SocialAssistanceService'
import type { IncomingApiData, FormValue, OutgoingApiData } from '@/models/SocialAssistance'
import UserAgency from '@/models/UserAgency'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { IncomingUser } from '@/models/User'

export const useSocialAssistanceStore = defineStore('social_assistances', () => {
    const social_assistances = ref<IncomingApiData[]>([])
    const dashboard = ref<any | null>(null)
    const pagination = ref<any | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const searchQuery = ref<string>('')
    const filterQuery = ref<string>('')
    const router = useRouter()
    const authStore = useAuthStore()
    const auth = computed<IncomingUser | null>(() => authStore.user)

  // Kolom dinamis berdasarkan properti dari IncomingApiData
    const columns = computed(() => {
        if (!social_assistances.value.length) return []
        const sampleAgency = social_assistances.value[0]
        return Object.keys(sampleAgency).map((prop) => {
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

    const fetchData = async (page: number = 1, search: string = '', bidang_instansi_id: string = '') => {
        loading.value = true
        error.value = null
        
        try {
            const response = await socialAssistanceService.getAll(page, search, String(auth.value?.bidang_instansi?.id || bidang_instansi_id))
            social_assistances.value = response.data.data
            pagination.value = response.data.pagination
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat mengambil data instansi.'
        } finally {
            loading.value = false
        }
    }
    const dashboardData = async (bantuan_sosial_id: string = '') => {
        loading.value = true
        error.value = null
        
        try {
            const response = await socialAssistanceService.dashboard(bantuan_sosial_id)
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
                console.log(data);
                
                // formData.append('email', data.user_id.email)
            }
            const response = await socialAssistanceService.create(formData)
            social_assistances.value.unshift(response.data)
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
            const response = await socialAssistanceService.update(id, formData)
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
            const response = await socialAssistanceService.show(id)
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
            await socialAssistanceService.deleteMultiple(ids); // Gunakan API multi-delete baru
            social_assistances.value = social_assistances.value.filter(agency => !ids.includes(agency.id)); // Perbarui store setelah delete
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
            await socialAssistanceService.delete(id)
            social_assistances.value = social_assistances.value.filter(i => i.id !== id)
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
        social_assistances,
        pagination,
        dashboard,
        loading,
        error,
        searchQuery,
        filterQuery,
        columns,
        fetchData,
        dashboardData,
        createData,
        deleteMultipleData,
        updateData,
        deleteData,
        showData,
        setSearchQuery,
        setFilterQuery,
    }
})