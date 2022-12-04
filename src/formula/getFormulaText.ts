import {createReducer} from "./createReducer";

/**
 * Retrieves the text of the formula
 * @param formula The formula to get the text for
 * @returns The formula text
 */
export const getFormulaText = createReducer<string>({
    variable: ({name}) => name,
    true: () => "true",
    false: () => "false",
    exists: ({formula, action}) => `<${action}>${formula}`,
    forall: ({formula, action}) => `[${action}]${formula}`,
    disjunction: ({left, right}) => `(${left} || ${right})`,
    conjunction: ({left, right}) => `(${left} && ${right})`,
    leastFixpoint: ({variable, formula}) => `mu ${variable}. ${formula}`,
    greatestFixpoint: ({variable, formula}) => `nu ${variable}. ${formula}`,
});
