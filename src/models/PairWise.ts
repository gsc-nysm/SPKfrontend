export interface IncomingApiData {
    id: number
    kriteria_1_id: number
    kriteria_2_id: number
    nilai_perbandingan: number
    tipe: string    
}

export interface OutgoingApiData {
    _method?: 'PUT'
    kriteria_1_id: number
    kriteria_2_id: number
    nilai_perbandingan: number
    tipe: string 
}
    
export interface FormValue {
    _method?: 'PUT'
    kriteria_1_id: number
    kriteria_2_id: number
    nilai_perbandingan: number
    tipe: string 
}

type ReturnType<S, From, To> = S extends From[] ? To[] : To

export default class PairWise {
    constructor(
        public id: number,
        public kriteria_1_id: number,
        public kriteria_2_id: number,
        public nilai_perbandingan: number,
        public tipe: string,       
    ) {}
  
    public static fromApiData<T extends IncomingApiData | IncomingApiData[]>(apiData: T): ReturnType<T, IncomingApiData, PairWise> {
        if (Array.isArray(apiData)) return apiData.map((object) => this.fromApiData(object)) as ReturnType<T, IncomingApiData, PairWise>
        return new PairWise(
            apiData.id,
            apiData.kriteria_1_id,
            apiData.kriteria_2_id,
            apiData.nilai_perbandingan,
            apiData.tipe,            
        ) as ReturnType<T, IncomingApiData, PairWise>
    }

    public static toApiData<T extends FormValue | FormValue[]>(pair_wise: T): ReturnType<T, FormValue, OutgoingApiData> {
      if (Array.isArray(pair_wise)) return pair_wise.map((object) => this.toApiData(object)) as ReturnType<T, FormValue, OutgoingApiData>
      const apiData: OutgoingApiData = {
        ...(pair_wise._method ? { _method: pair_wise._method } : {}),
        kriteria_1_id: pair_wise.kriteria_1_id,
        kriteria_2_id: pair_wise.kriteria_2_id,
        nilai_perbandingan: pair_wise.nilai_perbandingan,
        tipe: pair_wise.tipe,        
      }
      return apiData as ReturnType<T, FormValue, OutgoingApiData>
    }
  }