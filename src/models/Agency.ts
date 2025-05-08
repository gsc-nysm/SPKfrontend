export interface IncomingApiData {
    id: number
    nama_instansi: string
    alamat: string
    logo: string
    status: string
    kode_instansi: string
    tingkatan: string
    created_at: string
  }
  
export interface OutgoingApiData {
    _method?: 'PUT'
    nama_instansi: string
    alamat: string
    logo: string
    kode_instansi: string
    status: 'aktif' | 'non-aktif'
    tingkatan: string
}
    
export interface FormValue {
    _method?: 'PUT'
    nama_instansi: string
    alamat: string
    logo: string
    kode_instansi: string
    status: 'aktif' | 'non-aktif'
    tingkatan: string
}
  
type ReturnType<S, From, To> = S extends From[] ? To[] : To
  
export default class Agency {
    constructor(
        public id: number,
        public nama_instansi: string,
        public alamat: string,
        public kode_instansi: string,
        public tingkatan: string,
        public status: string,
        public logo: string,
        public created_at: string,
    ) {}
  
    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, Agency> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, Agency>
        return new Agency(
            apiData.id,
            apiData.nama_instansi,
            apiData.alamat,
            apiData.kode_instansi,
            apiData.tingkatan,
            apiData.status,
            apiData.logo,
            apiData.created_at
        ) as ReturnType<T, IncomingApiData, Agency>
    }

    public static toApiData<T extends FormValue | FormValue[]>(instansi: T): ReturnType<T, FormValue, OutgoingApiData> {
      if (Array.isArray(instansi)) return instansi.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
      const apiData: OutgoingApiData = {
        ...(instansi._method ? { _method: instansi._method } : {}),
        nama_instansi: instansi.nama_instansi,
        alamat: instansi.alamat,
        logo: instansi.logo,
        kode_instansi: instansi.kode_instansi,
        tingkatan: instansi.tingkatan,
        status: instansi.status,
      }
      return apiData as ReturnType<T, FormValue, OutgoingApiData>
    }
  }