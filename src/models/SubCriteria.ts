export interface IncomingApiData {
    id: number
    nama_sub_kriteria: string
    kriteria_bantuan_id: {
        id: number
        kode_kriteria: string
        nama_kriteria: string
        bantuan_sosial_id: number
        bobot: string
        urutan: number
        perlu_bukti_pendukung: string
    }    
    bobot: number
    urutan: number
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
    nama_sub_kriteria: string
    kriteria_bantuan_id: number    
}
    
export interface FormValue {
    _method?: 'PUT'
    nama_sub_kriteria: string
    kriteria_bantuan_id: number
}

type ReturnType<S, From, To> = S extends From[] ? To[] : To

export default class SubCriteria {
    constructor(
        public id: number,
        public nama_sub_kriteria: string,
        public bobot: number,
        public urutan: number,
        public kriteria_bantuan_id: {
            id: number
            kode_kriteria: string
            nama_kriteria: string
            bantuan_sosial_id: number
            bobot: string
            urutan: number
            perlu_bukti_pendukung: string
        },        
        public pair_wise_comparison: {
            id: number
            kriteria_1_id: number
            kriteria_2_id: number
            nilai_perbandingan: number
            bantuan_sosial_id: number
        }[]
    ) {
    }

    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, SubCriteria> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, SubCriteria>
        return new SubCriteria(
            apiData.id,
            apiData.nama_sub_kriteria,
            apiData.bobot,
            apiData.urutan,
            {
                id : apiData.kriteria_bantuan_id.id,
                kode_kriteria : apiData.kriteria_bantuan_id.kode_kriteria,
                nama_kriteria : apiData.kriteria_bantuan_id.nama_kriteria,
                bantuan_sosial_id : apiData.kriteria_bantuan_id.bantuan_sosial_id,
                bobot : apiData.kriteria_bantuan_id.bobot,
                urutan : apiData.kriteria_bantuan_id.urutan,
                perlu_bukti_pendukung : apiData.kriteria_bantuan_id.perlu_bukti_pendukung
            },                                
            (apiData.pair_wise_comparison ?? []).map((pair_wise) => ({
                id: pair_wise.id,
                kriteria_1_id: pair_wise.kriteria_1_id,
                kriteria_2_id: pair_wise.kriteria_2_id,
                nilai_perbandingan: pair_wise.nilai_perbandingan,
                bantuan_sosial_id: pair_wise.bantuan_sosial_id,                
            }))
        ) as ReturnType<T, IncomingApiData, SubCriteria>
    }

    public static toApiData<T extends FormValue | FormValue[]>(sub_kriteria: T): ReturnType<T, FormValue, OutgoingApiData> {
        if (Array.isArray(sub_kriteria)) return sub_kriteria.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
        const apiData: OutgoingApiData = {
            ...(sub_kriteria._method ? { _method: sub_kriteria._method } : {}),
            nama_sub_kriteria: sub_kriteria.nama_sub_kriteria,
            kriteria_bantuan_id: sub_kriteria.kriteria_bantuan_id,              
        }
        return apiData as ReturnType<T, FormValue, OutgoingApiData>
        }
    }