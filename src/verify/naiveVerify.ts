import {IFormulaAST, ILTS} from "../_types";
import {IVerifyResult} from "../_types/IVerifyResult";
import {equals, intersect, union} from "./setUtils";

/**
 * Verifies whether a given formula holds for a given LTS
 * @param lts The LTS in which to verify the formula
 * @param formula The formula to be satisfied
 * @returns The verification results
 */
export function naiveVerify(lts: ILTS, formula: IFormulaAST): IVerifyResult {
    const vars = new Map<string, Set<number>>();

    // Gets all states based on a formula and the action that should lead to states satisfying the formula
    function checkNext(
        action: string,
        formula: IFormulaAST,
        test: (toTransitions: number[], toFormula: Set<number>) => boolean
    ): Set<number> {
        const out = new Set<number>();
        const satisfyingStates = evalF(formula);
        const transitions = lts.transitions.get(action);
        if (!transitions) return lts.states;

        for (let state of lts.states) {
            const to = transitions.get(state) || [];
            if (test([...to], satisfyingStates)) out.add(state);
        }

        return out;
    }

    // Computes the fixpoint from an initial set
    function computeFixpoint(init: Set<number>, variable: string, formula: IFormulaAST) {
        let oldSet = init;
        vars.set(variable, oldSet);
        while (true) {
            const newSet = evalF(formula);
            const reachedFixPoint = equals(newSet, oldSet);
            if (reachedFixPoint) return newSet;

            vars.set(variable, newSet);
            oldSet = newSet;
        }
    }

    // Evaluates a given (sub) formula
    function evalF(f: IFormulaAST): Set<number> {
        if (f.type == "variable") return vars.get(f.name)!;
        else if (f.type == "true") return lts.states;
        else if (f.type == "false") return new Set();
        else if (f.type == "conjunction") return intersect(evalF(f.left), evalF(f.right));
        else if (f.type == "disjunction") return union(evalF(f.left), evalF(f.right));
        else if (f.type == "exists")
            return checkNext(f.action, f.formula, (toTransitions, satisfyingFormuula) =>
                toTransitions.some(x => satisfyingFormuula.has(x))
            );
        else if (f.type == "forall")
            return checkNext(f.action, f.formula, (toTransitions, satisfyingFormuula) =>
                toTransitions.every(x => satisfyingFormuula.has(x))
            );
        else if (f.type == "greatestFixpoint")
            return computeFixpoint(new Set(), f.variable, f.formula);
        else {
            //: if(f.type=="leastFixpoint")
            return computeFixpoint(lts.states, f.variable, f.formula);
        }
    }

    const states = evalF(formula);

    return {
        satisfyingStates: states,
        verified: states.has(lts.init),
    };
}
