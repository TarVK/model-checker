import {IFormulaAST} from "../_types";
import {
    IExtendedFormulaAST,
    IEActionSequence,
    IEActions,
} from "../_types/IExtendedFormulaAST";
import {TReducerType} from "./_types/TReducerType";

/**
 * Creates a new reducer from a given specification
 * @param reducer The reducer step specification
 * @returns The created reducer
 */
export const createReducer: <O>(
    reducer: TReducerType<IFormulaAST, O>
) => (formula: IFormulaAST) => O = createSharedReducer as any;

/**
 * Creates a new reducer from a given specification
 * @param reducer The reducer step specification
 * @returns The created reducer
 */
export const createExtendedReducer: <O>(
    reducer: TReducerType<IExtendedFormulaAST, O>
) => (formula: IExtendedFormulaAST) => O = createSharedReducer;

/**
 * Creates a new reducer from a given specification
 * @param reducer The reducer step specification
 * @returns The created reducer
 */
function createSharedReducer<O>(
    reducer: TReducerType<IFormulaAST | IExtendedFormulaAST, O>
): (formula: IExtendedFormulaAST) => O {
    const rec = (formula: IExtendedFormulaAST): O => {
        const combine = reducer[formula.type] as (arg: any) => O;
        const {type} = formula;
        if (type == "true" || type == "false" || type == "variable")
            return combine(formula);
        if (type == "conjunction" || type == "disjunction")
            return combine({
                ...formula,
                left: rec(formula.left),
                right: rec(formula.right),
            });
        if (type == "implies")
            return combine({
                ...formula,
                premise: rec(formula.premise),
                conclusion: rec(formula.conclusion),
            });
        if (
            type == "exists" ||
            type == "forall" ||
            type == "leastFixpoint" ||
            type == "greatestFixpoint" ||
            type == "negate"
        )
            return combine({...formula, formula: rec(formula.formula)});

        // Unreachable code
        return null as any;
    };

    return rec;
}

/**
 * Creates a reducer for an action of the extended formula AST
 * @param reducer The reducer step specification
 * @returns The created reducer
 */
export function createActionSetReducer<O>(
    reducer: TReducerType<IEActions, O>
): (formula: IEActions) => O {
    const rec = (formula: IEActions): O => {
        const combine = reducer[formula.type] as (arg: any) => O;
        const {type} = formula;
        if (type == "any" || type == "baseAction") return combine(formula);
        if (type == "union" || type == "intersection")
            return combine({
                ...formula,
                left: rec(formula.left),
                right: rec(formula.right),
            });
        if (type == "complement")
            return combine({
                ...formula,
                actions: rec(formula.actions),
            });

        // Unreachable code
        return null as any;
    };

    return rec;
}

/**
 * Creates a reducer for an action of the extended formula AST
 * @param reducer The reducer step specification
 * @returns The created reducer
 */
export function createActionReducer<O>(
    reducer: TReducerType<IEActionSequence, O>
): (formula: IEActionSequence) => O {
    const rec = (formula: IEActionSequence): O => {
        const combine = reducer[formula.type] as (arg: any) => O;
        const {type} = formula;
        if (type == "actionSet") return combine(formula);
        if (type == "or")
            return combine({
                ...formula,
                left: rec(formula.left),
                right: rec(formula.right),
            });
        if (type == "repeat0" || type == "repeat1")
            return combine({...formula, repeat: rec(formula.repeat)});
        if (type == "sequence")
            return combine({
                ...formula,
                first: rec(formula.first),
                last: rec(formula.last),
            });

        // Unreachable code
        return null as any;
    };

    return rec;
}
