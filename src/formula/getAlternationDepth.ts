import {IFormulaAST} from "../_types";
import {createReducer} from "./createReducer";

const base = {depth: 0, LFPDepth: 0, GFPDepth: 0};
export const getAlternationDepthData = createReducer<{
    depth: number;
    LFPDepth: number;
    GFPDepth: number;
}>({
    variable: () => base,
    true: () => base,
    false: () => base,
    exists: ({formula}) => formula,
    forall: ({formula}) => formula,
    disjunction: ({left, right}) => ({
        depth: Math.max(left.depth, right.depth),
        LFPDepth: Math.max(left.LFPDepth, right.LFPDepth),
        GFPDepth: Math.max(left.GFPDepth, right.GFPDepth),
    }),
    conjunction: ({left, right}) => ({
        depth: Math.max(left.depth, right.depth),
        LFPDepth: Math.max(left.LFPDepth, right.LFPDepth),
        GFPDepth: Math.max(left.GFPDepth, right.GFPDepth),
    }),
    leastFixpoint: ({formula}) => {
        const newDepth = Math.max(1, formula.depth, 1 + formula.GFPDepth);
        return {depth: newDepth, LFPDepth: newDepth, GFPDepth: formula.GFPDepth};
    },
    greatestFixpoint: ({formula}) => {
        const newDepth = Math.max(1, formula.depth, 1 + formula.LFPDepth);
        return {depth: newDepth, LFPDepth: formula.LFPDepth, GFPDepth: newDepth};
    },
});

/**
 * Retrieves the alternation depth of the given formula
 * @param formula The formula to get the alternation depth of
 * @returns The alternation depth of the formula
 */
export const getAlternationDepth = (formula: IFormulaAST) =>
    getAlternationDepthData(formula).depth;
