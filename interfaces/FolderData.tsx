interface Folder {
    _id: string;
    name: string;
    parent?: string; // Optional as not all folders have a parent
    path: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    procedures: Procedure[] | null
}

interface FoldersData {
    folders: Folder[];
}