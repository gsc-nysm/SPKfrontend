export interface IncomingApiData {
    id: number
    calon_penerima_id: {
        id: number
        pengajuan_id: number
        bantuan_sosial_id: number
        nama_lengkap: string
        nik: string
        alamat: string
        desil: string
        bantuan_diterima: string
        jenis_kelamin: string
        keterangan: string
        status: string
    }    
    bukti_pendukung: string
    sub_kriteria_bantuan_id: {
        id: number
        nama_sub_kriteria: string
        kriteria_bantuan_id: {
            id: number
            nama_kriteria: string
            kode_kriteria: string
            perlu_bukti_pendukung: boolean
            urutan: number
            bantuan_sosial_id: number
            bobot: number
        }
        bobot: number
        urutan: number
    };
}

export interface OutgoingApiData {
    _method?: 'PUT'
    calon_penerima_id: number
    sub_kriteria_bantuan_id: string
    bukti_pendukung?: string
}
    
export interface FormValue {
    _method?: 'PUT'
    calon_penerima_id: number
    sub_kriteria_bantuan_id: string
    bukti_pendukung?: string
}

type ReturnType<S, From, To> = S extends From[] ? To[] : To

export default class Criteria {
    constructor(
        public id: number,
        public calon_penerima_id: {
            id: number
            pengajuan_id: number
            bantuan_sosial_id: number
            nama_lengkap: string
            nik: string
            alamat: string
            desil: string
            bantuan_diterima: string
            jenis_kelamin: string
            keterangan: string
            status: string
        },
        public sub_kriteria_bantuan_id: {
            id: number
            nama_sub_kriteria: string
            kriteria_bantuan_id: {
                id: number
                nama_kriteria: string
                kode_kriteria: string
                perlu_bukti_pendukung: boolean
                urutan: number
                bantuan_sosial_id: number
                bobot: number
            }
            bobot: number
            urutan: number
        },
        public bukti_pendukung: string
    ) {
    }

    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, Criteria> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, Criteria>
        return new Criteria(
            apiData.id,            
            {
                id : apiData.calon_penerima_id.id,
                pengajuan_id : apiData.calon_penerima_id.pengajuan_id,
                bantuan_sosial_id : apiData.calon_penerima_id.bantuan_sosial_id,
                nama_lengkap : apiData.calon_penerima_id.nama_lengkap,
                nik : apiData.calon_penerima_id.nik,
                alamat : apiData.calon_penerima_id.alamat,
                desil : apiData.calon_penerima_id.desil,
                bantuan_diterima : apiData.calon_penerima_id.bantuan_diterima,
                jenis_kelamin : apiData.calon_penerima_id.jenis_kelamin,
                keterangan : apiData.calon_penerima_id.keterangan,
                status : apiData.calon_penerima_id.status
            },        
            {
                id : apiData.sub_kriteria_bantuan_id.id,
                nama_sub_kriteria : apiData.sub_kriteria_bantuan_id.nama_sub_kriteria,
                kriteria_bantuan_id: {
                    id: apiData.sub_kriteria_bantuan_id.kriteria_bantuan_id.id,
                    nama_kriteria: apiData.sub_kriteria_bantuan_id.kriteria_bantuan_id.nama_kriteria,
                    kode_kriteria: apiData.sub_kriteria_bantuan_id.kriteria_bantuan_id.kode_kriteria,
                    perlu_bukti_pendukung: apiData.sub_kriteria_bantuan_id.kriteria_bantuan_id.perlu_bukti_pendukung,
                    urutan: apiData.sub_kriteria_bantuan_id.kriteria_bantuan_id.urutan,
                    bantuan_sosial_id: apiData.sub_kriteria_bantuan_id.kriteria_bantuan_id.bantuan_sosial_id,
                    bobot: apiData.sub_kriteria_bantuan_id.kriteria_bantuan_id.bobot,
                },
                bobot : apiData.sub_kriteria_bantuan_id.bobot,
                urutan : apiData.sub_kriteria_bantuan_id.urutan
            },        
            apiData.bukti_pendukung
        ) as ReturnType<T, IncomingApiData, Criteria>
    }

    public static toApiData<T extends FormValue | FormValue[]>(penilaian: T): ReturnType<T, FormValue, OutgoingApiData> {
        if (Array.isArray(penilaian)) return penilaian.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
        const apiData: OutgoingApiData = {
            ...(penilaian._method ? { _method: penilaian._method } : {}),
            calon_penerima_id: penilaian.calon_penerima_id,
            sub_kriteria_bantuan_id: penilaian.sub_kriteria_bantuan_id,
            bukti_pendukung: penilaian.bukti_pendukung,
        }
        return apiData as ReturnType<T, FormValue, OutgoingApiData>
        }
    }