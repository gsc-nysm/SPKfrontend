export interface IncomingUser {
    id: number
    name: string
    email: string
    instansi?:{
        id: number
        nama_instansi: string
        status: string
        tingkatan: string
    }
    bidang_instansi?:{
        id: number
        nama_bidang: string
    },
    anggota_instansi?:{
        id: number
        nama_lengkap: string
        no_hp: string
    }
    role?:{
        id:number,
        name:string
        permissions: string[]
    }
    permissions:string[]
}