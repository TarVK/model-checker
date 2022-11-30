import {createReducer} from "./createReducer";

/**
 * Retrieves the depth of the formula
 * @param formula The formula to get the fixpoint depth for
 * @returns The fixpoint depth
 */
export const getDepth = createReducer<number>({
    variable: () => 0,
    true: () => 0,
    false: () => 0,
    exists: ({formula}) => formula,
    forall: ({formula}) => formula,
    disjunction: ({left, right}) => Math.max(left, right),
    conjunction: ({left, right}) => Math.max(left, right),
    leastFixpoint: ({formula}) => 1 + formula,
    greatestFixpoint: ({formula}) => 1 + formula,
});
