export interface IncomingApiData {
    id: number
    nama_bantuan: string
    bidang_instansi_id: {
        id: number
        nama_bidang: string
        instansi_id: number
    }
    jenis_bantuan: string
    deskripsi: string
    created_at: string
  }
  
export interface OutgoingApiData {
    _method?: 'PUT'
    nama_bantuan: string
    jenis_bantuan: string
    deskripsi: string    
}
    
export interface FormValue {
    _method?: 'PUT'
    nama_bantuan: string
    jenis_bantuan: string
    deskripsi: string
}

type ReturnType<S, From, To> = S extends From[] ? To[] : To

export default class SocialAssistance {
    constructor(
        public id: number,
        public nama_bantuan: string,
        public jenis_bantuan: string,
        public deskripsi: string,
        public bidang_instansi_id: {
            id: number
            nama_bidang: string
            instansi_id: number
        },        
        public created_at: string,
    ) {}

    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, SocialAssistance> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, SocialAssistance>
        return new SocialAssistance(
            apiData.id,
            apiData.nama_bantuan,
            apiData.jenis_bantuan,
            apiData.deskripsi,
            {
                id: apiData.bidang_instansi_id.id,
                nama_bidang: apiData.bidang_instansi_id.nama_bidang,
                instansi_id: apiData.bidang_instansi_id.instansi_id
            },        
            apiData.created_at    
        ) as ReturnType<T, IncomingApiData, SocialAssistance>
    }

    public static toApiData<T extends FormValue | FormValue[]>(instansi: T): ReturnType<T, FormValue, OutgoingApiData> {
        if (Array.isArray(instansi)) return instansi.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
        const apiData: OutgoingApiData = {
            ...(instansi._method ? { _method: instansi._method } : {}),
            nama_bantuan: instansi.nama_bantuan,
            jenis_bantuan: instansi.jenis_bantuan,
            deskripsi: instansi.deskripsi,       
        }
        return apiData as ReturnType<T, FormValue, OutgoingApiData>
    }
}