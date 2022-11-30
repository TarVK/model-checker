export type IFormulaAST =
    | IFalse
    | ITrue
    | IVariable
    | IConjunction
    | IDisjunction
    | IExistsPath
    | IForallPaths
    | ILeastFixpoint
    | IGreatestFixpoint;

export type IFalse = {type: "false"};
export type ITrue = {type: "true"};
export type IVariable = {type: "variable"; name: string};
export type IConjunction = {type: "conjunction"; left: IFormulaAST; right: IFormulaAST};
export type IDisjunction = {type: "disjunction"; left: IFormulaAST; right: IFormulaAST};
export type IExistsPath = {type: "exists"; action: string; formula: IFormulaAST};
export type IForallPaths = {type: "forall"; action: string; formula: IFormulaAST};
export type ILeastFixpoint = {
    type: "leastFixpoint";
    variable: string;
    formula: IFormulaAST;
};
export type IGreatestFixpoint = {
    type: "greatestFixpoint";
    variable: string;
    formula: IFormulaAST;
};
