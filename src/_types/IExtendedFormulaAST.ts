export type IExtendedFormulaAST =
    | IEFalse
    | IETrue
    | IEVariable
    | IENegation
    | IEConjunction
    | IEDisjunction
    | IEExistsPath
    | IEForallPaths
    | IELeastFixpoint
    | IEGreatestFixpoint;

export type IEFalse = {type: "false"};
export type IETrue = {type: "true"};
export type IEVariable = {type: "variable"; name: string};
export type IENegation = {type: "negate"; formula: IExtendedFormulaAST};
export type IEConjunction = {
    type: "conjunction";
    left: IExtendedFormulaAST;
    right: IExtendedFormulaAST;
};
export type IEDisjunction = {
    type: "disjunction";
    left: IExtendedFormulaAST;
    right: IExtendedFormulaAST;
};
export type IEExistsPath = {type: "exists"; action: string; formula: IExtendedFormulaAST};
export type IEForallPaths = {
    type: "forall";
    action: string;
    formula: IExtendedFormulaAST;
};
export type IELeastFixpoint = {
    type: "leastFixpoint";
    variable: string;
    formula: IExtendedFormulaAST;
};
export type IEGreatestFixpoint = {
    type: "greatestFixpoint";
    variable: string;
    formula: IExtendedFormulaAST;
};
