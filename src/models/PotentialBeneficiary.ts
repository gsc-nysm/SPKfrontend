export interface IncomingApiData {
    id: number
    bantuan_sosial_id: {
        id: number
        nama_bantuan_sosial: string
        bidang_instansi_id: number
        jenis_bantuan: string
        deskripsi: string
    }
    hasil_akhir?: {
        id: number
        calon_penerima_id: number
        nilai_preferensi?: string
        nilai_saw?: string
        jarak_solusi_positif?: string
        jarak_solusi_negatif?: string
    }
    matriks_keputusan?: {
        id: number
        calon_penerima_id: number
        kriteria_bantuan_id: {
            id: number
            kode_kriteria: string
            nama_kriteria: string
        }
        nilai_awal: string
        nilai_normalisasi: string
        nilai_saw: string
    }[]
    pengajuan_id: {
        id: number
        periode_pendaftaran_id: {
            id: number
            nama_periode: string
            tahun: string
        }
        instansi_id: {
            id: number
            nama_instansi: string
            kode_instansi: string
            logo: string
            alamat: string
        }
        status: string
        dokumen: string
    }
    nama_lengkap: string
    jenis_kelamin: string
    nik: string
    alamat: string
    desil: string
    bantuan_diterima: string
    status: string
    tahapan: string
    keterangan: string
    peringkat?: string
    created_at: string
}

export interface OutgoingApiData {
    _method?: 'PUT'
    bantuan_sosial_id: number
    pengajuan_id: number
    nama_lengkap: string
    nik: string
    alamat: string
    desil: string
    bantuan_diterima: string
    jenis_kelamin: string
    keterangan?: string
}
    
export interface FormValue {
    _method?: 'PUT'
    bantuan_sosial_id: number
    pengajuan_id: number
    nama_lengkap: string
    nik: string
    alamat: string
    desil: string
    bantuan_diterima: string
    jenis_kelamin: string
    keterangan?: string
}

type ReturnType<S, From, To> = S extends From[] ? To[] : To

export default class PotentialBeneficiary {
    constructor(
        public id: number,
        public bantuan_sosial_id: {
            id: number;
            nama_bantuan_sosial: string;
            jenis_bantuan: string;
            deskripsi: string;
            bidang_instansi_id: number
        },
        public hasil_akhir: {
            id: number
            calon_penerima_id: number
            nilai_preferensi?: string
            nilai_saw?: string
            jarak_solusi_positif?: string
            jarak_solusi_negatif?: string
        },
        public matriks_keputusan: {
            id: number
            calon_penerima_id: number
            kriteria_bantuan_id: {
                id: number
                kode_kriteria: string
                nama_kriteria: string
            }
            nilai_awal: string
            nilai_normalisasi: string
            nilai_saw: string
        }[],
        public pengajuan_id: {
            id: number;
            periode_pendaftaran_id: {
                id: number;
                nama_periode: string;
                tahun: string;
            }
            instansi_id: {
                id: number;
                nama_instansi: string;
                kode_instansi: string;
                logo: string;
                alamat: string;
            }
            status: string;
            dokumen: string;            
        },
        public nama_lengkap: string,
        public jenis_kelamin: string,
        public nik: string,
        public alamat: string,
        public desil: string,
        public bantuan_diterima: string,
        public peringkat: string,
        public status: string,
        public tahapan: string,
        public keterangan: string,
        public created_at: string,
    ) {}

    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, PotentialBeneficiary> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, PotentialBeneficiary>
        return new PotentialBeneficiary(
            apiData.id,
            {
                id: apiData.bantuan_sosial_id.id,
                nama_bantuan_sosial: apiData.bantuan_sosial_id.nama_bantuan_sosial,
                jenis_bantuan: apiData.bantuan_sosial_id.jenis_bantuan,
                deskripsi: apiData.bantuan_sosial_id.deskripsi,                
                bidang_instansi_id: apiData.bantuan_sosial_id.bidang_instansi_id,                
            },
            {
                id: apiData.hasil_akhir!.id,
                calon_penerima_id: apiData.hasil_akhir!.calon_penerima_id,
                nilai_preferensi: apiData.hasil_akhir!.nilai_preferensi,
                nilai_saw: apiData.hasil_akhir!.nilai_saw,                
                jarak_solusi_negatif: apiData.hasil_akhir!.jarak_solusi_negatif,                
                jarak_solusi_positif: apiData.hasil_akhir!.jarak_solusi_positif,                
            },
            (apiData.matriks_keputusan ?? []).map((matriks_keputusan) => ({
                id: matriks_keputusan.id,
                calon_penerima_id: matriks_keputusan.calon_penerima_id,
                kriteria_bantuan_id: {
                    id: matriks_keputusan.kriteria_bantuan_id.id,
                    kode_kriteria: matriks_keputusan.kriteria_bantuan_id.kode_kriteria,
                    nama_kriteria: matriks_keputusan.kriteria_bantuan_id.nama_kriteria,
                },
                nilai_awal: matriks_keputusan.nilai_awal,
                nilai_normalisasi: matriks_keputusan.nilai_normalisasi,                
                nilai_saw: matriks_keputusan.nilai_saw,                
            })),
            {
                id: apiData.pengajuan_id.id,
                periode_pendaftaran_id: {
                    id: apiData.pengajuan_id.periode_pendaftaran_id.id,
                    nama_periode: apiData.pengajuan_id.periode_pendaftaran_id.nama_periode,
                    tahun: apiData.pengajuan_id.periode_pendaftaran_id.tahun,
                },
                instansi_id: {
                    id: apiData.pengajuan_id.instansi_id.id,
                    nama_instansi: apiData.pengajuan_id.instansi_id.nama_instansi,
                    kode_instansi: apiData.pengajuan_id.instansi_id.kode_instansi,
                    logo: apiData.pengajuan_id.instansi_id.logo,
                    alamat: apiData.pengajuan_id.instansi_id.alamat,
                },
                status: apiData.pengajuan_id.status,
                dokumen: apiData.pengajuan_id.dokumen,                
            },
            apiData.nama_lengkap,
            apiData.jenis_kelamin,
            apiData.nik,
            apiData.alamat,
            apiData.desil,
            apiData.bantuan_diterima,
            apiData.peringkat ?? "-",
            apiData.status,
            apiData.tahapan,
            apiData.keterangan,
            apiData.created_at,
        ) as ReturnType<T, IncomingApiData, PotentialBeneficiary>
    }

    public static toApiData<T extends FormValue | FormValue[]>(potential_beneficiary: T): ReturnType<T, FormValue, OutgoingApiData> {
        if (Array.isArray(potential_beneficiary)) return potential_beneficiary.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
        const apiData: OutgoingApiData = {
            ...(potential_beneficiary._method ? { _method: potential_beneficiary._method } : {}),
            bantuan_sosial_id: potential_beneficiary.bantuan_sosial_id,
            pengajuan_id: potential_beneficiary.pengajuan_id,
            nama_lengkap: potential_beneficiary.nama_lengkap,
            nik: potential_beneficiary.nik,
            alamat: potential_beneficiary.alamat,
            desil: potential_beneficiary.desil,
            bantuan_diterima: potential_beneficiary.bantuan_diterima,
            jenis_kelamin: potential_beneficiary.jenis_kelamin,
            keterangan: potential_beneficiary.keterangan,
        }
        return apiData as ReturnType<T, FormValue, OutgoingApiData>
        }
    }