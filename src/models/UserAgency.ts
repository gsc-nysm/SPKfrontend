export interface IncomingApiData {
    id: number
    nama_lengkap: string
    no_hp: string
    bidang_instansi_id: {
        id: number
        nama_bidang: string
        instansi_id: number
    }
    user_id: {
        id: number
        name: string
        email: string
    }    
    created_at: string
}

export interface OutgoingApiData {
    _method?: 'PUT'
    nama_lengkap: string
    email: string
    no_hp: string
    bidang_instansi_id: number  
}
    
export interface FormValue {
    _method?: 'PUT'
    nama_lengkap: string
    email: string
    no_hp: string
    bidang_instansi_id: number | string | null
}

type ReturnType<S, From, To> = S extends From[] ? To[] : To

export default class UserAgency {
    constructor(
        public id: number,
        public nama_lengkap: string,
        public no_hp: string,
        public bidang_instansi_id: {
            id: number
            nama_bidang: string
            instansi_id: number
        },
        public user_id: {
            id: number
            name: string
            email: string
        },        
        public created_at: string,
    ) {}

    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, UserAgency> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, UserAgency>
        return new UserAgency(
            apiData.id,
            apiData.nama_lengkap,
            apiData.no_hp,
            {
                id: apiData.bidang_instansi_id.id,
                nama_bidang: apiData.bidang_instansi_id.nama_bidang,
                instansi_id: apiData.bidang_instansi_id.instansi_id,
            },
            {
                id: apiData.user_id.id,
                name: apiData.user_id.name,
                email: apiData.user_id.email
            },            
            apiData.created_at
        ) as ReturnType<T, IncomingApiData, UserAgency>
    }

    public static toApiData<T extends FormValue | FormValue[]>(user_agency: T): ReturnType<T, FormValue, OutgoingApiData> {
        if (Array.isArray(user_agency)) return user_agency.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
        const apiData: OutgoingApiData = {
            ...(user_agency._method ? { _method: user_agency._method } : {}),
            nama_lengkap: user_agency.nama_lengkap,
            email: user_agency.email,
            no_hp: user_agency.no_hp,
            bidang_instansi_id: Number(user_agency.bidang_instansi_id),
        }
        return apiData as ReturnType<T, FormValue, OutgoingApiData>
    }
}