import {IFalse, ITrue, IVariable} from "../../../_types/IFormulaAST";

/**
 * A formula AST annotated with some data to run Emerson-Lei's algorithm more easily
 */
export type IEmersonLeiFormulaAST =
    | IFalse
    | ITrue
    | IVariable
    | IELConjunction
    | IELDisjunction
    | IELExistsPath
    | IELForallPaths
    | IELLeastFixpoint
    | IELGreatestFixpoint;

export type IELConjunction = {
    type: "conjunction";
    left: IEmersonLeiFormulaAST;
    right: IEmersonLeiFormulaAST;
};
export type IELDisjunction = {
    type: "disjunction";
    left: IEmersonLeiFormulaAST;
    right: IEmersonLeiFormulaAST;
};
export type IELExistsPath = {
    type: "exists";
    action: string;
    formula: IEmersonLeiFormulaAST;
};
export type IELForallPaths = {
    type: "forall";
    action: string;
    formula: IEmersonLeiFormulaAST;
};
export type IELLeastFixpoint = {
    type: "leastFixpoint";
    variable: string;
    formula: IEmersonLeiFormulaAST;
    openLeastFixpoints: Set<IELLeastFixpoint>;
};
export type IELGreatestFixpoint = {
    type: "greatestFixpoint";
    variable: string;
    formula: IEmersonLeiFormulaAST;
    openGreatestFixpoints: Set<IELGreatestFixpoint>;
};
