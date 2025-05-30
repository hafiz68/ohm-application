interface RootObject {
    procedures: ProcedureNode[];
}
interface ProcedureNode {
    endProcedure: Step;
    procedureSafetyNote: ProcedureSafetyNote;
    _id: string;
    name: string;
    users: User[];
    images: Image[];
    procedures: Procedure[];
    folderId: FolderId;
    comments: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    url: string;
    author: string
}
interface FolderId {
    _id: string;
    name: string;
    path: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}
interface Procedure {
    steps?: Step;
    decisions: Decisions;
    _id: string;
}
interface Decisions {
    answer: (Answer)[];
    title?: string;
    decisionInfo?: string;
}
interface Answer {
    _ans: string;
    type: string;
    _associate: string;
    _id: string;
}
interface Image {
    name: string;
    src: string;
    _id: string;
}
interface User {
    user: string;
    isAllowed: boolean;
    _id: string;
}
interface ProcedureSafetyNote {
    title: string;
    procedureNoteInfo: string;
}
interface Step {
    title: string;
    stepInfo: string;
}