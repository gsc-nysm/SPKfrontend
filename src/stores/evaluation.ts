import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { evalutionService } from '@/services/EvaluationService'
import type { IncomingApiData } from '@/models/Evaluation'
import Evaluation from '@/models/Evaluation'

export const useEvaluationStore = defineStore('evaluations', () => {
    const evaluations = ref<IncomingApiData[]>([])
    const pagination = ref<any | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const searchQuery = ref<string>('')
    const filterQuery = ref<string>('')

  // Kolom dinamis berdasarkan properti dari IncomingApiData
    const columns = computed(() => {
        if (!evaluations.value.length) return []
        const sampleData = evaluations.value[0]
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

    const fetchData = async (page: number = 1,per_page: number = 10, search: string = '', calon_penerima_id: string = '', sub_kriteria_bantuan_id: string = '') => {
        loading.value = true
        error.value = null
        try {
            const response = await evalutionService.getAll(page, per_page, search, calon_penerima_id, sub_kriteria_bantuan_id)
            evaluations.value = response.data.data
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
            // Buat FormData untuk mengirim data
            const formData = new FormData();

            // Konversi array of objects ke format FormData dengan indeks
            data.forEach((item:any, index:any) => {
                // Tambahkan calon_penerima_id dan sub_kriteria_bantuan_id
                formData.append(`${index}[calon_penerima_id]`, item.calon_penerima_id.toString());
                formData.append(`${index}[sub_kriteria_bantuan_id]`, item.sub_kriteria_bantuan_id.toString());

                // Jika ada bukti_pendukung (file), tambahkan ke FormData
                if (item.bukti_pendukung instanceof File) {
                    formData.append(`${index}[bukti_pendukung]`, item.bukti_pendukung);
                }else {
                    formData.append(`${index}[bukti_pendukung]`, ''); // Kirim string kosong jika tidak ada file
                }
            });
            const response = await evalutionService.create(formData)
            evaluations.value.unshift(response.data)
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
            const response = await evalutionService.update(id, formData)
            // const index = evaluations.value.findIndex(agency => agency.id === id)
            // if (index !== -1) {
            //     evaluations.value[index] = response.data // Perbarui store dengan data terbaru dari backend
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
            const response = await evalutionService.show(id)
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
            await evalutionService.deleteMultiple(ids); // Gunakan API multi-delete baru
            evaluations.value = evaluations.value.filter(agency => !ids.includes(agency.id)); // Perbarui store setelah delete
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
            await evalutionService.delete(id)
            evaluations.value = evaluations.value.filter(i => i.id !== id)
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
        evaluations,
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