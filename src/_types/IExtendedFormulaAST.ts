export type IExtendedFormulaAST =
    | IEFalse
    | IETrue
    | IEVariable
    | IENegation
    | IEConjunction
    | IEDisjunction
    | IEImplies
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
export type IEImplies = {
    type: "implies";
    premise: IExtendedFormulaAST;
    conclusion: IExtendedFormulaAST;
};
export type IEExistsPath = {
    type: "exists";
    action: IEActionSequence;
    formula: IExtendedFormulaAST;
};
export type IEForallPaths = {
    type: "forall";
    action: IEActionSequence;
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

export type IEActions = IESingleAction | IEComplement | IEUnion | IEIntersection | IEAny;
export type IEAny = {type: "any"};
export type IEUnion = {type: "union"; left: IEActions; right: IEActions};
export type IEIntersection = {type: "intersection"; left: IEActions; right: IEActions};
export type IEComplement = {type: "complement"; actions: IEActions};
export type IESingleAction = {type: "baseAction"; action: string};

export type IEActionSequence =
    | IEActionSet
    | IEActionOr
    | IEActionSeq
    | IEActionMultiple
    | IEActionOneOrMore;
export type IEActionSet = {type: "actionSet"; actions: IEActions};
export type IEActionSeq = {
    type: "sequence";
    first: IEActionSequence;
    last: IEActionSequence;
};
export type IEActionOr = {type: "or"; left: IEActionSequence; right: IEActionSequence};
export type IEActionMultiple = {type: "repeat0"; repeat: IEActionSequence};
export type IEActionOneOrMore = {type: "repeat1"; repeat: IEActionSequence};
