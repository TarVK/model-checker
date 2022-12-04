import {createReducer} from "../../formula";
import {IFormulaAST} from "../../_types";
import {add, remove, union} from "../setUtils";
import {
    IELGreatestFixpoint,
    IELLeastFixpoint,
    IEmersonLeiFormulaAST,
} from "./_types/IEmersonLeiFormulaAST";

export const getEmersonLeiFormulaData = createReducer<{
    formula: IEmersonLeiFormulaAST;
    openLeastFixpoints: Set<IELLeastFixpoint>;
    openGreatestFixpoints: Set<IELGreatestFixpoint>;
    freeVariables: Set<string>;
}>({
    variable: formula => ({
        formula,
        openGreatestFixpoints: new Set(),
        openLeastFixpoints: new Set(),
        freeVariables: add(new Set(), formula.name),
    }),
    true: formula => ({
        formula,
        openGreatestFixpoints: new Set(),
        openLeastFixpoints: new Set(),
        freeVariables: new Set(),
    }),
    false: formula => ({
        formula,
        openGreatestFixpoints: new Set(),
        openLeastFixpoints: new Set(),
        freeVariables: new Set(),
    }),
    exists: ({type, formula, action}) => ({
        ...formula,
        formula: {type, action, formula: formula.formula},
    }),
    forall: ({type, formula, action}) => ({
        ...formula,
        formula: {type, action, formula: formula.formula},
    }),
    disjunction: ({type, left, right}) => ({
        formula: {type, left: left.formula, right: right.formula},
        openLeastFixpoints: union(left.openLeastFixpoints, right.openLeastFixpoints),
        openGreatestFixpoints: union(
            left.openGreatestFixpoints,
            right.openGreatestFixpoints
        ),
        freeVariables: union(left.freeVariables, right.freeVariables),
    }),
    conjunction: ({type, left, right}) => ({
        formula: {type, left: left.formula, right: right.formula},
        openLeastFixpoints: union(left.openLeastFixpoints, right.openLeastFixpoints),
        openGreatestFixpoints: union(
            left.openGreatestFixpoints,
            right.openGreatestFixpoints
        ),
        freeVariables: union(left.freeVariables, right.freeVariables),
    }),
    leastFixpoint: ({type, formula, variable}) => {
        const freeVariables = remove(formula.freeVariables, variable);

        const openLeastFixpoints = new Set(formula.openLeastFixpoints);
        const newFormula: IELLeastFixpoint = {
            type,
            formula: formula.formula,
            variable,
            openLeastFixpoints,
        };
        if (freeVariables.size > 0) openLeastFixpoints.add(newFormula);

        return {
            formula: newFormula,
            openLeastFixpoints,
            openGreatestFixpoints: formula.openGreatestFixpoints,
            freeVariables,
        };
    },
    greatestFixpoint: ({type, formula, variable}) => {
        const freeVariables = remove(formula.freeVariables, variable);

        const openGreatestFixpoints = new Set(formula.openGreatestFixpoints);
        const newFormula: IELGreatestFixpoint = {
            type,
            formula: formula.formula,
            variable,
            openGreatestFixpoints,
        };
        if (freeVariables.size > 0) openGreatestFixpoints.add(newFormula);

        return {
            formula: newFormula,
            openLeastFixpoints: formula.openLeastFixpoints,
            openGreatestFixpoints,
            freeVariables,
        };
    },
});

/**
 * Retrieves the alternation depth of the given formula
 * @param formula The formula to get the alternation depth of
 * @returns The alternation depth of the formula
 */
export const getEmersonLeiFormula = (formula: IFormulaAST) =>
    getEmersonLeiFormulaData(formula).formula;
