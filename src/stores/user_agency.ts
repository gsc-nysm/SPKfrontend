import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userAgencyService } from '@/services/UserAgencyService'
import type { IncomingApiData, FormValue, OutgoingApiData } from '@/models/UserAgency'
import UserAgency from '@/models/UserAgency'
import { useRouter } from 'vue-router'
import { authService } from '@/services/AuthService'

export const useUserAgencyStore = defineStore('user_agencies', () => {
    const user_agencies = ref<IncomingApiData[]>([])
    const pagination = ref<any | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const searchQuery = ref<string>('')
    const filterQuery = ref<string>('')
    const router = useRouter()

  // Kolom dinamis berdasarkan properti dari IncomingApiData
    const columns = computed(() => {
        if (!user_agencies.value.length) return []
        const sampleAgency = user_agencies.value[0]
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

    const fetchData = async (page: number = 1, per_page: number = 10, search: string = '', bidang_instansi_id: string = '', instansi_id: string = '') => {
        loading.value = true
        error.value = null
        
        try {
            const response = await userAgencyService.getAll(page,per_page, search, bidang_instansi_id, router.currentRoute.value.params?.id as string ?? instansi_id)
            user_agencies.value = response.data.data            
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
            const response = await userAgencyService.create(formData)
            user_agencies.value.unshift(response.data)
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
            
            formData.append('_method', 'PUT')
            const response = await userAgencyService.update(id, formData)
            fetchData(pagination.value?.current_page || 1)
            return response.data
        } catch (err) {
            console.error('Gagal memperbarui instansi:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateProfile = async (id: number, data: any) => {
        loading.value = true
        try {
            
            const formData = new FormData()
            formData.append('nama_lengkap', data.nama_lengkap || '')
            formData.append('email', data.user_id.email || '')
            formData.append('no_hp', data.no_hp || '')
            formData.append('_method', 'PUT')
            const response = await userAgencyService.updateProfile(id, formData)
            fetchData(pagination.value?.current_page || 1)
            return response.data
        } catch (err) {
            console.error('Gagal memperbarui instansi:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const changePassword = async (data : any) => {
        loading.value = true
        try {            
            const response = await authService.changePassword(data)
            if (response.status === 200) {
                // Jika berhasil, dia akan login ulang
                await authService.logout()
            }

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
            const response = await userAgencyService.show(id)
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
            await userAgencyService.deleteMultiple(ids); // Gunakan API multi-delete baru
            user_agencies.value = user_agencies.value.filter(agency => !ids.includes(agency.id)); // Perbarui store setelah delete
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
            await userAgencyService.delete(id)
            user_agencies.value = user_agencies.value.filter(i => i.id !== id)
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
        user_agencies,
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
        updateProfile,
        deleteData,
        showData,
        setSearchQuery,
        setFilterQuery,
        changePassword,
    }
})