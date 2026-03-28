export interface Xuxemon {
    id: number,
    name: string,
    type: string,
    size: string,
    xuxes: number,
    owned: boolean,
    owned_xuxemon_id?: number,
    illnesses?: any[],
    number_xuxes?: number
}