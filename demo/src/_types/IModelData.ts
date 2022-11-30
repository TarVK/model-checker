import {IPoint} from "./IPoint";

/** The serializable modal data that can be saved on disk */
export type IModelData = {
    modelText: string;
    statePoses: Record<number, IPoint>;
    formulas: IFormulaData[];
};

/** The serializable formula data that can be saved on disk */
export type IFormulaData = {
    name: string;
    text: string;
};
