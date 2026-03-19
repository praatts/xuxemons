export interface Xuxemon {
    id: number,
    name: string,
    type: string,
    size: string,
    owned: boolean,
    owned_xuxemon_id?: number,
    illnesses?: string[]
}
