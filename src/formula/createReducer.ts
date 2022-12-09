import {IFormulaAST} from "../_types";
import {IExtendedFormulaAST} from "../_types/IExtendedFormulaAST";
import {TReducerType} from "./_types/TReducerType";

/**
 * Creates a new reducer from a given specification
 * @param reducer The reducer step specification
 * @returns The created reducer
 */
export const createReducer: <O>(
    reducer: TReducerType<IFormulaAST, O>
) => (formula: IFormulaAST) => O = createSharedReducer;

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
