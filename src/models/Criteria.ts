export interface IncomingApiData {
    id: number
    kode_kriteria: string
    nama_kriteria: string
    tipe: string
    bantuan_sosial_id: {
        id: number
        nama_bantuan: string
        bidang_instansi_id: number
        jenis_bantuan: string
        deskripsi: string
    }
    bobot: number
    urutan: number
    deskripsi: string
    perlu_bukti_pendukung: string
    sub_kriteria_bantuan?: {
        id: number
        nama_sub_kriteria: string
        kriteria_bantuan_id: number
        bobot: number
        urutan: number
    }[];
    pair_wise_comparison?: {
        id: number
        kriteria_1_id: number
        kriteria_2_id: number
        nilai_perbandingan: number
        bantuan_sosial_id: number        
    }[];
}

export interface OutgoingApiData {
    _method?: 'PUT'
    kode_kriteria: string
    nama_kriteria: string
    tipe: string
    deskripsi: string
    perlu_bukti_pendukung: string
    bantuan_sosial_id: number    
}
    
export interface FormValue {
    _method?: 'PUT'
    kode_kriteria: string
    nama_kriteria: string
    tipe: string
    deskripsi: string
    perlu_bukti_pendukung: string
    bantuan_sosial_id: number
}

type ReturnType<S, From, To> = S extends From[] ? To[] : To

export default class Criteria {
    constructor(
        public id: number,
        public kode_kriteria: string,
        public nama_kriteria: string,
        public bobot: number,
        public urutan: number,
        public perlu_bukti_pendukung: string,
        public tipe: string,
        public deskripsi: string,
        public bantuan_sosial_id: {
            id: number
            nama_bantuan: string
            bidang_instansi_id: number
            jenis_bantuan: string
            deskripsi: string
        },
        public sub_kriteria_bantuan: {
            id: number
            nama_sub_kriteria: string
            kriteria_bantuan_id: number
            bobot: number
            urutan: number
        }[],
        public pair_wise_comparison: {
            id: number
            kriteria_1_id: number
            kriteria_2_id: number
            nilai_perbandingan: number
            bantuan_sosial_id: number
        }[]
    ) {
    }

    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, Criteria> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, Criteria>
        return new Criteria(
            apiData.id,
            apiData.kode_kriteria,
            apiData.nama_kriteria,
            apiData.bobot,
            apiData.urutan,
            apiData.perlu_bukti_pendukung,
            apiData.tipe,
            apiData.deskripsi,
            {
                id : apiData.bantuan_sosial_id.id,
                nama_bantuan : apiData.bantuan_sosial_id.nama_bantuan,
                bidang_instansi_id : apiData.bantuan_sosial_id.bidang_instansi_id,
                jenis_bantuan : apiData.bantuan_sosial_id.jenis_bantuan,
                deskripsi : apiData.bantuan_sosial_id.deskripsi
            },        
            (apiData.sub_kriteria_bantuan ?? []).map((sub_kriteria_bantuan) => ({
                id: sub_kriteria_bantuan.id,
                nama_sub_kriteria: sub_kriteria_bantuan.nama_sub_kriteria,
                kriteria_bantuan_id: sub_kriteria_bantuan.kriteria_bantuan_id,
                bobot: sub_kriteria_bantuan.bobot,
                urutan: sub_kriteria_bantuan.urutan,                
            })),
            (apiData.pair_wise_comparison ?? []).map((pair_wise) => ({
                id: pair_wise.id,
                kriteria_1_id: pair_wise.kriteria_1_id,
                kriteria_2_id: pair_wise.kriteria_2_id,
                nilai_perbandingan: pair_wise.nilai_perbandingan,
                bantuan_sosial_id: pair_wise.bantuan_sosial_id,                
            }))
        ) as ReturnType<T, IncomingApiData, Criteria>
    }

    public static toApiData<T extends FormValue | FormValue[]>(kriteria: T): ReturnType<T, FormValue, OutgoingApiData> {
        if (Array.isArray(kriteria)) return kriteria.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
        const apiData: OutgoingApiData = {
            ...(kriteria._method ? { _method: kriteria._method } : {}),
            nama_kriteria: kriteria.nama_kriteria,
            kode_kriteria: kriteria.kode_kriteria,
            tipe: kriteria.tipe,
            deskripsi: kriteria.deskripsi,
            perlu_bukti_pendukung: kriteria.perlu_bukti_pendukung,
            bantuan_sosial_id: kriteria.bantuan_sosial_id,            
        }
        return apiData as ReturnType<T, FormValue, OutgoingApiData>
        }
    }