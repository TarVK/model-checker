import {IPoint} from "./IPoint";
import {IVerifyAlgoritm} from "./IVerifyAlgoritm";

/** The serializable modal data that can be saved on disk */
export type IModelData = {
    modelText: string;
    formulas: IFormulaData[];
    simplified?: boolean;
};

/** The serializable formula data that can be saved on disk */
export type IFormulaData = {
    name: string;
    description?: string;
    formula: string;
    algorithm?: IVerifyAlgoritm;
};
