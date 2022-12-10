import {IFormulaAST} from "../_types";
import {createReducer} from "./createReducer";

/**
 * Retrieves the same formula, but with ensured unique variable names
 * @param formula The formula to create an equivalent version of with unique variable names
 * @returns The new formula
 */
export const getFormulaWithUniqueVariables = (formula: IFormulaAST) =>
    getFormulaWithUniqueVariablesData(formula)(new Map(), new Set());

export const getFormulaWithUniqueVariablesData = createReducer<
    (map: Map<string, string>, taken: Set<string>) => IFormulaAST
>({
    variable:
        ({name}) =>
        map => ({type: "variable", name: map.get(name) ?? name}),
    true: v => () => v,
    false: v => () => v,
    exists:
        ({formula, ...rest}) =>
        (map, taken) => ({...rest, formula: formula(map, taken)}),
    forall:
        ({formula, ...rest}) =>
        (map, taken) => ({...rest, formula: formula(map, taken)}),
    disjunction:
        ({type, left, right}) =>
        (map, taken) => ({type, left: left(map, taken), right: right(map, taken)}),
    conjunction:
        ({type, left, right}) =>
        (map, taken) => ({type, left: left(map, taken), right: right(map, taken)}),
    leastFixpoint:
        ({type, variable, formula}) =>
        (map, taken) => {
            if (taken.has(variable)) {
                map = new Map(map);
                const newVariable = getVariableName(taken);
                map.set(variable, newVariable);
                variable = newVariable;
            } else taken.add(variable);
            return {type, variable, formula: formula(map, taken)};
        },
    greatestFixpoint:
        ({type, variable, formula}) =>
        (map, taken) => {
            if (taken.has(variable)) {
                map = new Map(map);
                const newVariable = getVariableName(taken);
                map.set(variable, newVariable);
                variable = newVariable;
            } else taken.add(variable);
            return {type, variable, formula: formula(map, taken)};
        },
});

/**
 * Retrieves an available variable name, and adds it to the taken set
 * @param taken The set of already taken variable names
 * @returns The available variable name
 */
export function getVariableName(taken: Set<string>): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let i = 0;
    while (true) {
        const iter = Math.floor(i / letters.length);
        const name = letters[i % letters.length] + (iter > 0 ? iter : "");
        if (!taken.has(name)) {
            taken.add(name);
            return name;
        }
        i++;
    }
}
