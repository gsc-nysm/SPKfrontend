export interface IncomingApiData {
    id: number
    bantuan_sosial_id: {
        id: number
        nama_bantuan_sosial: string
        jenis_bantuan: string
        deskripsi: string
    }
    user_id: {
        id: number,
        name: string,
        email: string,
    },
    bukti_dokumen: string
    created_at: string
}

export interface OutgoingApiData {
    _method?: 'PUT'
    bukti_dokumen: string
    bantuan_sosial_id: number
}
    
export interface FormValue {
    _method?: 'PUT'
    bukti_dokumen: string
    bantuan_sosial_id: number
}

type ReturnType<S, From, To> = S extends From[] ? To[] : To

export default class LogWeighting {
    constructor(
        public id: number,
        public bantuan_sosial_id: {
            id: number
            nama_bantuan_sosial: string
            jenis_bantuan: string
            deskripsi: string
        },
        public user_id: {
            id: number
            name: string
            email: string
        },
        public bukti_dokumen: string,
        public created_at: string
    ) {}

    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, LogWeighting> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, LogWeighting>
        return new LogWeighting(
            apiData.id,
            {
                id: apiData.bantuan_sosial_id.id,
                nama_bantuan_sosial: apiData.bantuan_sosial_id.nama_bantuan_sosial,
                jenis_bantuan: apiData.bantuan_sosial_id.jenis_bantuan,
                deskripsi: apiData.bantuan_sosial_id.deskripsi,
            },
            {
                id: apiData.user_id.id,
                name: apiData.user_id.name,
                email: apiData.user_id.email,
            },
            apiData.bukti_dokumen,
            apiData.created_at,
        ) as ReturnType<T, IncomingApiData, LogWeighting>
    }

    public static toApiData<T extends FormValue | FormValue[]>(log_weighting: T): ReturnType<T, FormValue, OutgoingApiData> {
        if (Array.isArray(log_weighting)) return log_weighting.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
        const apiData: OutgoingApiData = {
            ...(log_weighting._method ? { _method: log_weighting._method } : {}),
            bukti_dokumen: log_weighting.bukti_dokumen,         
            bantuan_sosial_id: log_weighting.bantuan_sosial_id,   
        }
        return apiData as ReturnType<T, FormValue, OutgoingApiData>
        }
    }