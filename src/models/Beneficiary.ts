export interface IncomingApiData {
    id: number
    kelompok_penerima_id: {
        id: number
        bantuan_sosial_id: {
            id: number
            nama_bantuan_sosial: string
            jenis_bantuan: string
            deskripsi: string
        }
        instansi_id: {
            id: number
            nama_instansi: string
            kode_instansi: string
            logo: string
            alamat: string
        }
    }
    calon_penerima_id: {
        id: number
        nama_lengkap: string
        jenis_kelamin: string
        nik: string
        alamat: string
        desil: string
        bantuan_diterima: string
        status: string
        keterangan: string
    }
    status: string
    created_at: string
}

export interface OutgoingApiData {
    _method?: 'PUT'
    calon_penerima_id: number
}
    
export interface FormValue {
    _method?: 'PUT'
    calon_penerima_id: number
}

type ReturnType<S, From, To> = S extends From[] ? To[] : To

export default class Beneficiary {
    constructor(
        public id: number,
        public kelompok_penerima_id: {
            id: number
            bantuan_sosial_id: {
                id: number
                nama_bantuan_sosial: string
                jenis_bantuan: string
                deskripsi: string
            }
            instansi_id: {
                id: number
                nama_instansi: string
                kode_instansi: string
                logo: string
                alamat: string
            }
        },
        public calon_penerima_id: {
            id: number
            nama_lengkap: string
            jenis_kelamin: string
            nik: string
            alamat: string
            desil: string
            bantuan_diterima: string
            status: string
            keterangan: string         
        },
        public status: string,
        public created_at: string
    ) {}

    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, Beneficiary> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, Beneficiary>
        return new Beneficiary(
            apiData.id,
            {
                id: apiData.kelompok_penerima_id.id,
                bantuan_sosial_id: {
                    id: apiData.kelompok_penerima_id.bantuan_sosial_id.id,
                    nama_bantuan_sosial: apiData.kelompok_penerima_id.bantuan_sosial_id.nama_bantuan_sosial,
                    jenis_bantuan: apiData.kelompok_penerima_id.bantuan_sosial_id.jenis_bantuan,
                    deskripsi: apiData.kelompok_penerima_id.bantuan_sosial_id.deskripsi,
                },
                instansi_id: {
                    id: apiData.kelompok_penerima_id.instansi_id.id,
                    nama_instansi: apiData.kelompok_penerima_id.instansi_id.nama_instansi,
                    kode_instansi: apiData.kelompok_penerima_id.instansi_id.kode_instansi,
                    logo: apiData.kelompok_penerima_id.instansi_id.logo,
                    alamat: apiData.kelompok_penerima_id.instansi_id.alamat,
                }
            },
            {
                id: apiData.calon_penerima_id.id,
                nama_lengkap: apiData.calon_penerima_id.nama_lengkap,
                jenis_kelamin: apiData.calon_penerima_id.jenis_kelamin,
                nik: apiData.calon_penerima_id.nik,
                alamat: apiData.calon_penerima_id.alamat,
                desil: apiData.calon_penerima_id.desil,
                bantuan_diterima: apiData.calon_penerima_id.bantuan_diterima,
                status: apiData.calon_penerima_id.status,
                keterangan: apiData.calon_penerima_id.keterangan,
            },
            apiData.status,
            apiData.created_at,
        ) as ReturnType<T, IncomingApiData, Beneficiary>
    }

    public static toApiData<T extends FormValue | FormValue[]>(beneficiary: T): ReturnType<T, FormValue, OutgoingApiData> {
        if (Array.isArray(beneficiary)) return beneficiary.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
        const apiData: OutgoingApiData = {
            ...(beneficiary._method ? { _method: beneficiary._method } : {}),
            calon_penerima_id: beneficiary.calon_penerima_id,            
        }
        return apiData as ReturnType<T, FormValue, OutgoingApiData>
        }
    }