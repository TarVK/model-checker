import {ILSTAST, ILTS} from "./_types";

/**
 * Creates a new LTS from a given LTS spec tree
 * @param ltsAst The AST representing an LTS
 * @returns The processed LTS
 */
export function createLTS(ltsAst: ILSTAST): ILTS {
    const states = new Set(ltsAst.transitions.flatMap(({from, to}) => [from, to]));
    const transitions: Map<string, Map<number, Set<number>>> = new Map();

    ltsAst.transitions.forEach(({from, label, to}) => {
        if (!transitions.has(label)) transitions.set(label, new Map());
        const trans = transitions.get(label)!;
        if (!trans.has(from)) trans.set(from, new Set());
        const tos = trans.get(from);
        tos?.add(to);
    });

    return {
        init: ltsAst.firstState,
        states,
        transitions,
    };
}
