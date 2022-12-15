import {add, intersect, remove, subtract, union} from "../verify";
import {IFormulaAST} from "../_types";
import {IExtendedFormulaAST} from "../_types/IExtendedFormulaAST";
import {
    createActionReducer,
    createActionSetReducer,
    createExtendedReducer,
} from "./createReducer";
import {getVariableName} from "./getFormulaWithUniqueVariables";
import {getFreeVariables} from "./getFreeVariables";

/**
 * Retrieves the reduced abstract syntax tree from an extended AST
 * @param formula The formula to get the reduced version of
 * @param universe The universe of available actions
 * @returns A set of variables that have been negated an odd number of times, or a reduced formula
 */
export function getReducedAST(
    formula: IExtendedFormulaAST,
    universe: Set<string>
): IFormulaAST | Set<string> {
    const invalidVariables = getInvertedVariables(formula)(false);
    if (invalidVariables.size > 0) return invalidVariables;

    return getInversionPushedDownAST(formula)(universe)(false);
}

const getExistsContext = (universe: Set<string>): IActionContext => ({
    prefix: (action, formula) => ({type: "exists", action, formula}),
    combine: (...parts) =>
        parts.length == 0
            ? {type: "false"}
            : parts.reduce((left, right) => ({type: "disjunction", left, right})),
    repeat: (repeat, next) => {
        const freeVariables = getFreeVariables(next);
        const varName = getVariableName(freeVariables);
        return {
            type: "leastFixpoint",
            variable: varName,
            formula: {
                type: "disjunction",
                left: repeat({type: "variable", name: varName}),
                right: next,
            },
        };
    },
    universe,
});

const getForallContext = (universe: Set<string>): IActionContext => ({
    prefix: (action, formula) => ({type: "forall", action, formula}),
    combine: (...parts) =>
        parts.length == 0
            ? {type: "true"}
            : parts.reduce((left, right) => ({type: "conjunction", left, right})),
    repeat: (repeat, next) => {
        const freeVariables = getFreeVariables(next);
        const varName = getVariableName(freeVariables);
        return {
            type: "greatestFixpoint",
            variable: varName,
            formula: {
                type: "conjunction",
                left: repeat({type: "variable", name: varName}),
                right: next,
            },
        };
    },
    universe,
});

/**
 * Retrieves an extended formula with inversion pushed all the way down
 */
// prettier-ignore
const getInversionPushedDownAST = createExtendedReducer<
    (universe: Set<string>) => (negated: boolean) => IFormulaAST
>({
    variable: formula => u => n => formula,
    true: formula => u => n => n ? {type: "false"} : formula,
    false: formula => u => n => n ? {type: "true"} : formula,
    negate: ({formula}) => u => n => formula(u)(!n),
    conjunction: ({left, right}) => u => n => ({
            type: n ? "disjunction" : "conjunction",
            left: left(u)(n),
            right: right(u)(n),
        }),
    disjunction: ({left, right}) => u => n => ({
            type: n ? "conjunction" : "disjunction",
            left: left(u)(n),
            right: right(u)(n),
        }),
    implies: ({premise, conclusion}) => u => n => ({
            type: n ? "conjunction" : "disjunction",
            left: premise(u)(!n),
            right: conclusion(u)(n),
        }),
    exists: ({action, formula}) => u =>n =>
            getActionExpander(action)(
                formula(u)(n),
                (n ? getForallContext : getExistsContext)(u)
            ),
    forall: ({action, formula}) => u => n =>
            getActionExpander(action)(
                formula(u)(n),
                (n ? getExistsContext : getForallContext)(u)
            ),
    leastFixpoint: ({variable, formula}) => u => n => ({
            type: n ? "greatestFixpoint" : "leastFixpoint",
            variable,
            formula: formula(u)(n),
        }),
    greatestFixpoint: ({variable, formula}) => u => n => ({
            type: n ? "leastFixpoint" : "greatestFixpoint",
            variable,
            formula: formula(u)(n),
        }),
});

/**
 * Retrieves all variables that are negated when pushed down fully
 */
// prettier-ignore
const getInvertedVariables = createExtendedReducer<(negated: boolean)=>Set<string>>({
    variable: ({name}) => n => n ? new Set([name]) : new Set(),
    true: () => n => new Set(),
    false: () => n => new Set(),
    negate: ({formula}) => n => formula(!n),
    conjunction: ({left, right}) => n => union(left(n), right(n)),
    disjunction: ({left, right}) => n => union(left(n), right(n)),
    implies: ({premise, conclusion}) => n => union(premise(!n), conclusion(n)),
    exists: ({formula}) => formula,
    forall: ({formula}) => formula,
    leastFixpoint: ({variable, formula}) => n => {
        const normal = formula(false); 
        if(!n) return normal;
        const negated = formula(true); 
        return normal.has(variable) ? add(negated, variable) : remove(negated, variable);
    },
    greatestFixpoint: ({variable, formula}) => n => {
        const normal = formula(false); 
        if(!n) return normal;
        const negated = formula(true); 
        return normal.has(variable) ? add(negated, variable) : remove(negated, variable);
    },
});

/**
 * Given a action set formula, creates a function that given a universe retrieves all actions specified by the action set formula
 * @param formula The action set formula for which to create the retriever
 * @returns The function which given a universe returns all specified actions
 */
// prettier-ignore
const getActionSetRetriever = createActionSetReducer<
    (universe: Set<string>) => Set<string>
>({
    any: () => universe => universe,
    baseAction: ({action}) => () => new Set([action]),
    complement: ({actions}) => universe => subtract(universe, actions(universe)),
    intersection: ({left, right}) => universe => intersect(left(universe), right(universe)),
    union: ({left, right}) => universe => union(left(universe), right(universe)),
});

/**
 * The context needed to deal with different universes and the difference between box and diamond modalities
 */
type IActionContext = {
    /** Prefixes a certain formula with an action, in accordance to the used modality */
    prefix: (action: string, next: IFormulaAST) => IFormulaAST;
    /** Combines multiple modality formulas together in acordance to the used modality */
    combine: (...parts: IFormulaAST[]) => IFormulaAST;
    /** Repeats a certain sequence in accordance to the used modality */
    repeat: (
        repeat: (next: IFormulaAST) => IFormulaAST,
        next: IFormulaAST
    ) => IFormulaAST;
    /** The universe of available actions */
    universe: Set<string>;
};

/**
 * Given a action formula, creates a function that given a context can expand all specified paths into a simplified formula
 * @param formula The action formula for whicho to create the retriever
 * @returns The function which given a context returns a formula that encodes the proper conditions for all specified paths
 */
// prettier-ignore
const getActionExpander = createActionReducer<
    (next: IFormulaAST, context: IActionContext) => IFormulaAST
>({
    actionSet: ({actions}) => (next, {prefix, combine, universe}) =>
            combine(
                ...[...getActionSetRetriever(actions)(universe)].map(action =>
                    prefix(action, next)
                )
            ),
    or: ({left, right}) => (next, c) => c.combine(left(next, c), right(next, c)),
    repeat0: ({repeat}) => (next, c) => c.repeat(repNext => repeat(repNext, c), next),
    repeat1: ({repeat}) => (next, c) => c.repeat(repNext => repeat(repNext, c), repeat(next, c)),
    sequence: ({first, last}) => (next, c) => first(last(next, c), c),
});
