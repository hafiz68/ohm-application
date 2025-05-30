export interface ProcedureFolderRoot {
    data: ProcedureFolder[]
}

export interface ProcedureFolder {
    _id: string
    name: string
    path: any[]
    createdAt: string
    updatedAt: string
    __v: number
    procedures: ProcedureNode[]
    children: Children[]
}



export interface Children {
    _id: string
    name: string
    parent: string
    path: any[]
    createdAt: string
    updatedAt: string
    __v: number
    procedures: ProcedureNode[]
    children: any[]
}
