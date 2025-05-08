import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { registrationPeriodService } from '@/services/RegistrationPeriodService'
import type { IncomingApiData, FormValue, OutgoingApiData } from '@/models/RegistrationPeriod'
import RegistrationPeriod from '@/models/RegistrationPeriod'
import { useRouter } from 'vue-router'

export const useRegistrationPeriodStore = defineStore('registration_period', () => {
    const registration_period = ref<IncomingApiData[]>([])
    const pagination = ref<any | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const searchQuery = ref<string>('')
    const filterQuery = ref<string>('')
    const router = useRouter()

  // Kolom dinamis berdasarkan properti dari IncomingApiData
    const columns = computed(() => {
        if (!registration_period.value.length) return []
        const sampleAgency = registration_period.value[0]
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

    const fetchData = async (page: number = 1,per_page:number = 10, search: string = '', bantuan_sosial_id: string = '',status: string = '') => {
        loading.value = true
        error.value = null
        
        try {
            const response = await registrationPeriodService.getAll(page,per_page, search, router.currentRoute.value.params?.id as string ?? bantuan_sosial_id, status)
            registration_period.value = response.data.data
            pagination.value = {
                current_page: response.data.pagination.current_page,
                per_page: per_page, // Gunakan perPage yang dikirim, bukan dari response
                total: response.data.pagination.total,
            };
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat mengambil data periode_pendaftaran.'
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
            formData.append('bantuan_sosial_id',router.currentRoute.value.params?.id as string ?? null)
            const response = await registrationPeriodService.create(formData)
            registration_period.value.unshift(response.data)
            await fetchData(pagination.value?.current_page || 1)
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat membuat periode_pendaftaran.'
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateData = async (id: number, data: any) => {
        loading.value = true
        try {
            console.log(data);
            
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
            formData.append('bantuan_sosial_id',router.currentRoute.value.params?.id as string ?? null)
            formData.append('_method', 'PUT')
            const response = await registrationPeriodService.update(id, formData)
            fetchData(pagination.value?.current_page || 1)
            return response.data
        } catch (err) {
            console.error('Gagal memperbarui periode_pendaftaran:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const showData = async (id: number) => {
        loading.value = true
        try {
            const response = await registrationPeriodService.show(id)
            return response.data
        } catch (err) {
            console.error('Gagal memuat detail periode_pendaftaran:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteMultipleData = async (ids: number[]) => {
        loading.value = true
        try {            
            await registrationPeriodService.deleteMultiple(ids); // Gunakan API multi-delete baru
            registration_period.value = registration_period.value.filter(agency => !ids.includes(agency.id)); // Perbarui store setelah delete
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
            await registrationPeriodService.delete(id)
            registration_period.value = registration_period.value.filter(i => i.id !== id)
            await fetchData(pagination.value?.current_page || 1)
        } catch (err:any) {
            error.value = err.message || 'Terjadi kesalahan saat menghapus periode_pendaftaran.'
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
        registration_period,
        pagination,
        loading,
        error,
        searchQuery,
        filterQuery,
        columns,
        fetchData,
        createData,
        deleteMultipleData,
        updateData,
        deleteData,
        showData,
        setSearchQuery,
        setFilterQuery,
    }
})