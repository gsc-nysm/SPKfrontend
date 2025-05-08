export interface IncomingApiData {
    id: number
    bantuan_sosial_id: {
        id: number
        nama_bantuan: string
        bidang_instansi_id: number
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
    tanggal_penerimaan: string
    status: string
    created_at: string
}

export interface OutgoingApiData {
    _method?: 'PUT'
    tanggal_penerimaan: string
}
    
export interface FormValue {
    _method?: 'PUT'
    tanggal_penerimaan: string
}

type ReturnType<S, From, To> = S extends From[] ? To[] : To

export default class BeneficiaryGroup {
    constructor(
        public id: number,
        public bantuan_sosial_id: {
            id: number
            nama_bantuan_sosial: string
            jenis_bantuan: string
            deskripsi: string
        },
        public instansi_id: {
            id: number
            nama_instansi: string
            kode_instansi: string
            logo: string
            alamat: string
        },
        public tanggal_penerimaan: string,
        public status: string,
        public created_at: string
    ) {}

    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, BeneficiaryGroup> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, BeneficiaryGroup>
        return new BeneficiaryGroup(
            apiData.id,
            {
                id: apiData.bantuan_sosial_id.id,
                nama_bantuan_sosial: apiData.bantuan_sosial_id.nama_bantuan,
                jenis_bantuan: apiData.bantuan_sosial_id.jenis_bantuan,
                deskripsi: apiData.bantuan_sosial_id.deskripsi,
            },
            {
                id: apiData.instansi_id.id,
                nama_instansi: apiData.instansi_id.nama_instansi,
                kode_instansi: apiData.instansi_id.kode_instansi,
                logo: apiData.instansi_id.logo,
                alamat: apiData.instansi_id.alamat,
            },            
            apiData.tanggal_penerimaan,
            apiData.status,
            apiData.created_at,
        ) as ReturnType<T, IncomingApiData, BeneficiaryGroup>
    }

    public static toApiData<T extends FormValue | FormValue[]>(beneficiary_group: T): ReturnType<T, FormValue, OutgoingApiData> {
        if (Array.isArray(beneficiary_group)) return beneficiary_group.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
        const apiData: OutgoingApiData = {
            ...(beneficiary_group._method ? { _method: beneficiary_group._method } : {}),
            tanggal_penerimaan: beneficiary_group.tanggal_penerimaan,            
        }
        return apiData as ReturnType<T, FormValue, OutgoingApiData>
        }
    }