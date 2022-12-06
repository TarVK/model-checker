import {add, remove, union} from "../verify";
import {IFormulaAST} from "../_types";
import {createReducer} from "./createReducer";

type ISubFormulas = {depth: number; freeVariables: Set<string>}[];
const free = new Set<string>();
const base = {
    depth: 0,
    freeVariables: free,
    leastSubFormulas: [],
    greatestSubFormulas: [],
};
export const getDependentAlternationDepthData = createReducer<{
    depth: number;
    freeVariables: Set<string>;
    leastSubFormulas: ISubFormulas;
    greatestSubFormulas: ISubFormulas;
}>({
    variable: ({name}) => ({...base, freeVariables: add(new Set(), name)}),
    true: () => base,
    false: () => base,
    exists: ({formula}) => formula,
    forall: ({formula}) => formula,
    disjunction: ({left, right}) => ({
        depth: Math.max(left.depth, right.depth),
        freeVariables: union(left.freeVariables, right.freeVariables),
        leastSubFormulas: [...left.leastSubFormulas, ...right.leastSubFormulas],
        greatestSubFormulas: [...left.greatestSubFormulas, ...right.greatestSubFormulas],
    }),
    conjunction: ({left, right}) => ({
        depth: Math.max(left.depth, right.depth),
        freeVariables: union(left.freeVariables, right.freeVariables),
        leastSubFormulas: [...left.leastSubFormulas, ...right.leastSubFormulas],
        greatestSubFormulas: [...left.greatestSubFormulas, ...right.greatestSubFormulas],
    }),
    leastFixpoint: ({
        variable,
        formula: {depth, freeVariables, leastSubFormulas, greatestSubFormulas},
    }) => {
        const maxDependentAlternatingSub = greatestSubFormulas.reduce(
            (max, {depth, freeVariables}) =>
                freeVariables.has(variable) ? Math.max(max, depth) : max,
            0
        );
        const newDepth = Math.max(1, depth, 1 + maxDependentAlternatingSub);
        const newFreeVariables = remove(freeVariables, variable);
        const removeVars = (v: ISubFormulas) =>
            v.map(val => ({...val, freeVariables: remove(val.freeVariables, variable)}));
        return {
            depth: newDepth,
            freeVariables: newFreeVariables,
            leastSubFormulas: removeVars([
                {depth: newDepth, freeVariables: newFreeVariables},
                ...leastSubFormulas,
            ]),
            greatestSubFormulas: removeVars(greatestSubFormulas),
        };
    },
    greatestFixpoint: ({
        variable,
        formula: {depth, freeVariables, leastSubFormulas, greatestSubFormulas},
    }) => {
        const maxDependentAlternatingSub = leastSubFormulas.reduce(
            (max, {depth, freeVariables}) =>
                freeVariables.has(variable) ? Math.max(max, depth) : max,
            0
        );
        const newDepth = Math.max(1, depth, 1 + maxDependentAlternatingSub);
        const newFreeVariables = remove(freeVariables, variable);
        const removeVars = (v: ISubFormulas) =>
            v.map(val => ({...val, freeVariables: remove(val.freeVariables, variable)}));
        return {
            depth: newDepth,
            freeVariables: newFreeVariables,
            leastSubFormulas: removeVars(greatestSubFormulas),
            greatestSubFormulas: removeVars([
                {depth: newDepth, freeVariables: newFreeVariables},
                ...leastSubFormulas,
            ]),
        };
    },
});

/**
 * Retrieves the alternation depth of the given formula
 * @param formula The formula to get the alternation depth of
 * @returns The alternation depth of the formula
 */
export const getDependentAlternationDepth = (formula: IFormulaAST) =>
    getDependentAlternationDepthData(formula).depth;
