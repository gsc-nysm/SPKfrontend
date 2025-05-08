export interface IncomingApiData {
    id: number
    nama_periode: string
    bantuan_sosial_id: {
        id: number
        nama_bantuan_sosial: string
        bidang_instansi: {
            id: number
            nama_bidang_instansi: string
        },
        instansi:{
            id: number
            nama_instansi: string
            logo: string
        },
        jenis_bantuan: string
        deskripsi: string
    }
    tahun: string
    tanggal_mulai: string
    tanggal_selesai: string
    status: string
    created_at: string
}

export interface OutgoingApiData {
    _method?: 'PUT'
    nama_periode: string
    tanggal_mulai: string
    tanggal_selesai: string
    tahun: string
    bantuan_sosial_id: number    
}
    
export interface FormValue {
    _method?: 'PUT'
    nama_periode: string
    tanggal_mulai: string
    tanggal_selesai: string
    tahun: string
    bantuan_sosial_id: number
}

type ReturnType<S, From, To> = S extends From[] ? To[] : To

export default class RegistrationPeriod {
    constructor(
        public id: number,
        public nama_periode: string,
        public bantuan_sosial_id: {
            id: number;
            nama_bantuan_sosial: string;
            jenis_bantuan: string;
            deskripsi: string;
            bidang_instansi: {
                id: number;
                nama_bidang_instansi: string;
            };
            instansi: {
                id: number;
                nama_instansi: string;
                logo: string;
            };
        },
        public tahun: string,
        public tanggal_mulai: string,
        public tanggal_selesai: string,
        public status: string,
        public created_at: string,
    ) {}

    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, RegistrationPeriod> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, RegistrationPeriod>
        return new RegistrationPeriod(
            apiData.id,
            apiData.nama_periode,
            {
                id: apiData.bantuan_sosial_id.id,
                nama_bantuan_sosial: apiData.bantuan_sosial_id.nama_bantuan_sosial,
                jenis_bantuan: apiData.bantuan_sosial_id.jenis_bantuan,
                deskripsi: apiData.bantuan_sosial_id.deskripsi,
                bidang_instansi: {
                    id: apiData.bantuan_sosial_id.bidang_instansi.id,
                    nama_bidang_instansi: apiData.bantuan_sosial_id.bidang_instansi.nama_bidang_instansi,
                },
                instansi: {
                    id: apiData.bantuan_sosial_id.instansi.id,
                    nama_instansi: apiData.bantuan_sosial_id.instansi.nama_instansi,
                    logo: apiData.bantuan_sosial_id.instansi.logo,
                },
            },
            apiData.tahun,
            apiData.tanggal_mulai,
            apiData.tanggal_selesai,
            apiData.status,
            apiData.created_at,
        ) as ReturnType<T, IncomingApiData, RegistrationPeriod>
    }

    public static toApiData<T extends FormValue | FormValue[]>(periode: T): ReturnType<T, FormValue, OutgoingApiData> {
        if (Array.isArray(periode)) return periode.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
        const apiData: OutgoingApiData = {
            ...(periode._method ? { _method: periode._method } : {}),
            nama_periode: periode.nama_periode,
            tanggal_mulai: periode.tanggal_mulai,
            tanggal_selesai: periode.tanggal_selesai,
            tahun: periode.tahun,
            bantuan_sosial_id: periode.bantuan_sosial_id,
        }
        return apiData as ReturnType<T, FormValue, OutgoingApiData>
        }
    }