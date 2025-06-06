export interface GetStudentScoreOutputModel {
    sbd: string,
    toan: number | null,
    ngu_van: number | null,
    ngoai_ngu: number | null,
    ma_ngoai_ngu: string | null,
    vat_li: number | null,
    hoa_hoc: number | null,
    sinh_hoc: number | null,
    lich_su: number | null,
    dia_li: number | null,
    gdcd: number | null
}

export interface GetStudentScoreOutputModelWithAverages extends GetStudentScoreOutputModel {
    average: number | null,
    natural_science_average: number | null,
    social_science_average: number | null
}
