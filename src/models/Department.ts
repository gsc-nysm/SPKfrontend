export interface IncomingApiData {
    id: number
    nama_bidang: string
    instansi_id: {
        id: number
        nama_instansi: string
        kode_instansi: number
        alamat: string
        logo: string
        tingkatan: string
        status: string
    }    
    created_at: string
}

export interface OutgoingApiData {
    _method?: 'PUT'
    nama_bidang: string
    instansi_id: number    
}
    
export interface FormValue {
    _method?: 'PUT'
    nama_bidang: string
    instansi_id: number    
}

type ReturnType<S, From, To> = S extends From[] ? To[] : To

export default class Department {
    constructor(
        public id: number,
        public nama_bidang: string,
        public instansi_id: {
            id: number
            nama_instansi: string
            kode_instansi: number
            alamat: string
            logo: string
            tingkatan: string
            status: string
        },         
        public created_at: string,
    ) {}

    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, Department> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, Department>
        return new Department(
            apiData.id,
            apiData.nama_bidang,            
            {
                id: apiData.instansi_id.id,
                nama_instansi: apiData.instansi_id.nama_instansi,
                kode_instansi: apiData.instansi_id.kode_instansi,
                alamat: apiData.instansi_id.alamat,
                logo: apiData.instansi_id.logo,
                tingkatan: apiData.instansi_id.tingkatan,
                status: apiData.instansi_id.status,
            },              
            apiData.created_at
        ) as ReturnType<T, IncomingApiData, Department>
    }

    public static toApiData<T extends FormValue | FormValue[]>(department: T): ReturnType<T, FormValue, OutgoingApiData> {
        if (Array.isArray(department)) return department.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
        const apiData: OutgoingApiData = {
            ...(department._method ? { _method: department._method } : {}),
            nama_bidang: department.nama_bidang,        
            instansi_id: department.instansi_id,        
        }
        return apiData as ReturnType<T, FormValue, OutgoingApiData>
    }
}