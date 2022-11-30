import {remove, union} from "../verify";
import {createReducer} from "./createReducer";

/**
 * Retrieves all unbound variables from a formula
 * @param formula The formula to get unbound variables from
 * @retuurns The unbound variables
 */
export const getFreeVariables = createReducer<Set<string>>({
    variable: ({name}) => new Set([name]),
    true: () => new Set(),
    false: () => new Set(),
    conjunction: ({left, right}) => union(left, right),
    disjunction: ({left, right}) => union(left, right),
    exists: ({formula}) => formula,
    forall: ({formula}) => formula,
    leastFixpoint: ({variable, formula}) => remove(formula, variable),
    greatestFixpoint: ({variable, formula}) => remove(formula, variable),
});
