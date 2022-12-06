import {IFormulaAST, ILTS} from "../../_types";
import {IVerifyResult} from "../../_types/IVerifyResult";
import {equals, intersect, union} from "../setUtils";
import {getEmersonLeiFormula} from "./getEmersonLeiFormula";
import {IEmersonLeiFormulaAST} from "./_types/IEmersonLeiFormulaAST";

/**
 * Verifies whether a given formula holds for a given LTS, using a slightly smarter algorithm for fixedpoints
 * @param lts The LTS in which to verify the formula
 * @param formula The formula to be satisfied
 * @returns The verification results
 */
export function emersonLeiVerify(lts: ILTS, formula: IFormulaAST): IVerifyResult {
    const vars = new Map<string, Set<number>>();
    let fixpointIterations = 0;

    // Initializes all variables at least once
    function initializeVariables(f: IEmersonLeiFormulaAST) {
        if (f.type == "conjunction" || f.type == "disjunction") {
            initializeVariables(f.left);
            initializeVariables(f.right);
        } else if (f.type == "exists" || f.type == "forall") {
            initializeVariables(f.formula);
        } else if (f.type == "leastFixpoint") {
            vars.set(f.variable, new Set());
            initializeVariables(f.formula);
        } else if (f.type == "greatestFixpoint") {
            vars.set(f.variable, lts.states);
            initializeVariables(f.formula);
        }
    }

    // Gets all states based on a formula and the action that should lead to states satisfying the formula
    function checkNext(
        action: string,
        formula: IEmersonLeiFormulaAST,
        test: (toTransitions: number[], toFormula: Set<number>) => boolean,
        parentBinder?: "least" | "greatest"
    ): Set<number> {
        const out = new Set<number>();
        const satisfyingStates = evalF(formula, parentBinder);
        const transitions = lts.transitions.get(action);
        if (!transitions) return lts.states;

        for (let state of lts.states) {
            const to = transitions.get(state) || [];
            if (test([...to], satisfyingStates)) out.add(state);
        }

        return out;
    }

    // Computes the fixpoint from an initial set
    function computeFixpoint(
        init: Set<number>,
        resetVars: Set<{variable: string}> | null,
        variable: string,
        formula: IEmersonLeiFormulaAST,
        parentBinder?: "least" | "greatest"
    ) {
        if (resetVars) for (let {variable} of resetVars) vars.set(variable, init);

        let oldSet = vars.get(variable)!;

        while (true) {
            fixpointIterations++;
            const newSet = evalF(formula, parentBinder);
            const reachedFixPoint = equals(newSet, oldSet);
            if (reachedFixPoint) return newSet;

            vars.set(variable, newSet);
            oldSet = newSet;
        }
    }

    // Evaluates a given (sub) formula
    function evalF(
        f: IEmersonLeiFormulaAST,
        parentBinder?: "least" | "greatest"
    ): Set<number> {
        if (f.type == "variable") return vars.get(f.name)!;
        else if (f.type == "true") return lts.states;
        else if (f.type == "false") return new Set();
        else if (f.type == "conjunction")
            return intersect(evalF(f.left, parentBinder), evalF(f.right, parentBinder));
        else if (f.type == "disjunction")
            return union(evalF(f.left, parentBinder), evalF(f.right, parentBinder));
        else if (f.type == "exists")
            return checkNext(
                f.action,
                f.formula,
                (toTransitions, satisfyingFormula) =>
                    toTransitions.some(x => satisfyingFormula.has(x)),
                parentBinder
            );
        else if (f.type == "forall")
            return checkNext(
                f.action,
                f.formula,
                (toTransitions, satisfyingFormula) =>
                    toTransitions.every(x => satisfyingFormula.has(x)),
                parentBinder
            );
        else if (f.type == "greatestFixpoint")
            return computeFixpoint(
                lts.states,
                parentBinder == "least" ? f.openGreatestFixpoints : null,
                f.variable,
                f.formula,
                "greatest"
            );
        else {
            //: if(f.type=="leastFixpoint")
            return computeFixpoint(
                new Set(),
                parentBinder == "greatest" ? f.openLeastFixpoints : null,
                f.variable,
                f.formula,
                "least"
            );
        }
    }

    const emersonLeiFormula = getEmersonLeiFormula(formula);
    initializeVariables(emersonLeiFormula);
    const states = evalF(emersonLeiFormula);

    return {
        satisfyingStates: states,
        verified: states.has(lts.init),
        fixpointIterations,
    };
}
