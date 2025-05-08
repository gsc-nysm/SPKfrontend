import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import type { AxiosResponse, AxiosError } from 'axios'
import { ElNotification } from 'element-plus'

// Ambil URL API dari environment
const API_URL = import.meta.env.VITE_API_URL

// Inisialisasi instance axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout request dalam milidetik (opsional)
})

// Interceptor untuk request
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') // Ganti dengan logika autentikasi kamu
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor untuk response
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {

    // Cek method request (harus lowercase, karena axios mengembalikan 'get', 'post', dll.)
    const isGetRequest = response.config.method?.toLowerCase() === 'get'

    if (!isGetRequest && (response.status === 200 || response.status === 201)) {
      // Tampilkan notifikasi sukses hanya untuk method selain GET dan bukan /v1/auth/me
      ElNotification({
        title: 'Sukses',
        message: response.data.message || 'Operasi berhasil!',
        type: 'success',
      })
    }
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      const responseData = error.response.data as { message?: string; errors?: Record<string, string[]> }

      if (status === 422) { // Validasi gagal (Unprocessable Entity)
        const errorMessages:any = []
        if (responseData.errors) {
          // Ekstrak semua pesan error dari field 'errors'
          for (const [field, messages] of Object.entries(responseData.errors)) {
            messages.forEach((msg) => errorMessages.push(`${field}: ${msg}`))
          }
          // Tampilkan semua pesan error menggunakan ElNotification
          ElNotification({
            title: 'Validasi Gagal',
            message: errorMessages.join('\n'), // Tampilkan semua pesan dalam satu notifikasi
            type: 'error',
            duration: 5000, // Durasi notifikasi (5 detik)
          })
        } else if (responseData.message) {
          // Jika hanya ada pesan umum, tampilkan itu
          ElNotification({
            title: 'Gagal',
            message: responseData.message,
            type: 'error',
          })
        }
      } else if (status === 401) {
        ElNotification({
          title: 'Gagal',
          message: 'Sesi berakhir, silakan login kembali',
          type: 'error',
        })
      } else if (status === 403) {
        ElNotification({
          title: 'Gagal',
          message: 'Akses Ditolak',
          type: 'error',
        })
      } else if (status >= 500) {
        ElNotification({
          title: 'Gagal',
          message: 'Server error. Silakan coba lagi nanti',
          type: 'error',
        })
      } else {
        ElNotification({
          title: 'Gagal',
          message: responseData.message || 'Terjadi kesalahan pada server',
          type: 'error',
        })
      }
    } else if (error.request) {
      ElNotification({
        title: 'Gagal',
        message: 'Tidak ada respons dari server. Periksa koneksi internet',
        type: 'error',
      })
    } else {
      ElNotification({
        title: 'Gagal',
        message: 'Terjadi kesalahan tak terduga',
        type: 'error',
      })
    }
    return Promise.reject(error)
  }
)

// Ekspor instance axios yang sudah dikonfigurasi
export default axiosInstance