import {add, remove, union} from "../verify";
import {IFormulaAST} from "../_types";
import {IExtendedFormulaAST} from "../_types/IExtendedFormulaAST";
import {createExtendedReducer} from "./createReducer";

/**
 * Retrieves the reduced abstract syntax tree from an extended AST
 * @param formula The formula to get the reduced version of
 * @returns A set of variables that have been negated an odd number of times, or a reduced formula
 */
export function getReducedAST(formula: IExtendedFormulaAST): IFormulaAST | Set<string> {
    const {normal: invalid, negated} = getInvertedVariables(formula);
    if (invalid.size > 0) return invalid;

    return getInversionPushedDownAST(formula).normal;
}

/**
 * Retrieves an extended formula with inversion pushed all the way down
 */
const getInversionPushedDownAST = createExtendedReducer<{
    negated: IFormulaAST;
    normal: IFormulaAST;
}>({
    variable: formula => ({negated: formula, normal: formula}),
    true: formula => ({negated: {type: "false"}, normal: formula}),
    false: formula => ({negated: {type: "true"}, normal: formula}),
    negate: ({formula: {normal, negated: inverted}}) => ({
        negated: normal,
        normal: inverted,
    }),
    conjunction: ({left, right}) => ({
        negated: {type: "disjunction", left: left.negated, right: right.negated},
        normal: {type: "conjunction", left: left.normal, right: right.normal},
    }),
    disjunction: ({left, right}) => ({
        negated: {type: "conjunction", left: left.negated, right: right.negated},
        normal: {type: "disjunction", left: left.normal, right: right.normal},
    }),
    exists: ({action, formula: {negated: inverted, normal}}) => ({
        negated: {type: "forall", action, formula: inverted},
        normal: {type: "exists", action, formula: normal},
    }),
    forall: ({action, formula: {negated: inverted, normal}}) => ({
        negated: {type: "exists", action, formula: inverted},
        normal: {type: "forall", action, formula: normal},
    }),
    leastFixpoint: ({variable, formula: {negated: inverted, normal}}) => ({
        negated: {type: "greatestFixpoint", variable, formula: inverted},
        normal: {type: "leastFixpoint", variable, formula: normal},
    }),
    greatestFixpoint: ({variable, formula: {negated: inverted, normal}}) => ({
        negated: {type: "leastFixpoint", variable, formula: inverted},
        normal: {type: "greatestFixpoint", variable, formula: normal},
    }),
});

/**
 * Retrieves all variables that are negated when pushed down fully
 */
const getInvertedVariables = createExtendedReducer<{
    negated: Set<string>;
    normal: Set<string>;
}>({
    variable: ({name}) => ({negated: new Set([name]), normal: new Set()}),
    true: () => ({negated: new Set(), normal: new Set()}),
    false: () => ({negated: new Set(), normal: new Set()}),
    negate: ({formula: {negated, normal}}) => ({negated: normal, normal: negated}),
    conjunction: ({left, right}) => ({
        negated: union(left.negated, right.negated),
        normal: union(left.normal, right.normal),
    }),
    disjunction: ({left, right}) => ({
        negated: union(left.negated, right.negated),
        normal: union(left.normal, right.normal),
    }),
    exists: ({formula: {negated, normal}}) => ({negated, normal}),
    forall: ({formula: {negated, normal}}) => ({negated, normal}),
    leastFixpoint: ({variable, formula: {negated, normal}}) => ({
        negated: normal.has(variable)
            ? add(negated, variable)
            : remove(negated, variable),
        normal: normal,
    }),
    greatestFixpoint: ({variable, formula: {negated, normal}}) => ({
        negated: normal.has(variable)
            ? add(negated, variable)
            : remove(negated, variable),
        normal: normal,
    }),
});
