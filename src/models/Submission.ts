export interface IncomingApiData {
    id: number
    instansi_id: {
        id: number
        nama_instansi: string
        kode_instansi: string
        alamat: string
        logo: string
        tingkatan: string
        status: string
    }
    periode_pendaftaran_id: {
        id: number
        nama_periode: string
        bantuan_sosial_id:{
            id: number
            nama_bantuan_sosial: string
            jenis_bantuan: string
            deskripsi: string
            bidang_instansi: {
                id: number
                nama_bidang_instansi: string
            }
            instansi: {
                id: number
                nama_instansi: string
                logo: string
            }
        }
        tahun: string
        tanggal_mulai: string
        tanggal_selesai: string
    }
    dokumen: string,
    status: string,
    created_at: string
  }
  
export interface OutgoingApiData {
    _method?: 'PUT'
    instansi_id: number
    periode_pendaftaran_id: number
    bukti_pendukung?: string    
}
    
export interface FormValue {
    _method?: 'PUT'
    instansi_id: number
    periode_pendaftaran_id: number
    bukti_pendukung?: string
}
  
type ReturnType<S, From, To> = S extends From[] ? To[] : To
  
export default class Agency {
    constructor(
        public id: number,
        public instansi_id:{
            id: number
            nama_instansi: string
            kode_instansi: string
            alamat: string
            logo: string
            tingkatan: string
            status: string
        },
        public periode_pendaftaran_id: {
            id: number
            nama_periode: string
            bantuan_sosial_id:{
                id: number
                nama_bantuan_sosial: string
                jenis_bantuan: string
                deskripsi: string
                bidang_instansi: {
                    id: number
                    nama_bidang_instansi: string
                }
                instansi: {
                    id: number
                    nama_instansi: string
                    logo: string
                }
            }
            tahun: string
            tanggal_mulai: string
            tanggal_selesai: string            
        },
        public status: string,   
        public dokumen: string,   
        public created_at: string     
    ) {}
  
    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, Agency> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, Agency>
        return new Agency(
            apiData.id,
            {
                id : apiData.instansi_id.id,
                nama_instansi : apiData.instansi_id.nama_instansi,
                kode_instansi : apiData.instansi_id.kode_instansi,
                alamat : apiData.instansi_id.alamat,
                logo : apiData.instansi_id.logo,
                tingkatan : apiData.instansi_id.tingkatan,
                status : apiData.instansi_id.status
            },     
            {
                id : apiData.periode_pendaftaran_id.id,
                nama_periode : apiData.periode_pendaftaran_id.nama_periode,
                bantuan_sosial_id: {
                    id: apiData.periode_pendaftaran_id.bantuan_sosial_id.id,
                    nama_bantuan_sosial: apiData.periode_pendaftaran_id.bantuan_sosial_id.nama_bantuan_sosial,
                    jenis_bantuan: apiData.periode_pendaftaran_id.bantuan_sosial_id.jenis_bantuan,
                    deskripsi: apiData.periode_pendaftaran_id.bantuan_sosial_id.deskripsi,
                    bidang_instansi: {
                        id: apiData.periode_pendaftaran_id.bantuan_sosial_id.bidang_instansi.id,
                        nama_bidang_instansi: apiData.periode_pendaftaran_id.bantuan_sosial_id.bidang_instansi.nama_bidang_instansi,
                    },
                    instansi: {
                        id: apiData.periode_pendaftaran_id.bantuan_sosial_id.instansi.id,
                        nama_instansi: apiData.periode_pendaftaran_id.bantuan_sosial_id.instansi.nama_instansi,
                        logo: apiData.periode_pendaftaran_id.bantuan_sosial_id.instansi.logo,
                    },                 
                },
                tahun : apiData.periode_pendaftaran_id.tahun,
                tanggal_mulai : apiData.periode_pendaftaran_id.tanggal_mulai,
                tanggal_selesai : apiData.periode_pendaftaran_id.tanggal_selesai,
            },     
            apiData.status,           
            apiData.dokumen,           
            apiData.created_at
        ) as ReturnType<T, IncomingApiData, Agency>
    }

    public static toApiData<T extends FormValue | FormValue[]>(pengajuan: T): ReturnType<T, FormValue, OutgoingApiData> {
      if (Array.isArray(pengajuan)) return pengajuan.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
      const apiData: OutgoingApiData = {
        ...(pengajuan._method ? { _method: pengajuan._method } : {}),
        instansi_id: pengajuan.instansi_id,
        periode_pendaftaran_id: pengajuan.periode_pendaftaran_id,
        bukti_pendukung: pengajuan.bukti_pendukung,        
      }
      return apiData as ReturnType<T, FormValue, OutgoingApiData>
    }
  }