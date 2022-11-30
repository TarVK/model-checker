import {ILTS} from "model-checker";

/**
 * Retrieves the list of transitions of a LTS
 * @param lts The LTS to get the transition list for
 * @returns The list of transitions
 */
export function getTransitions(
    lts: ILTS
): {from: number; to: number; actions: string[]}[] {
    const arcs = new Map<number, Map<number, string[]>>();

    for (let [action, trans] of lts.transitions) {
        for (let [from, tos] of trans) {
            for (let to of tos) {
                if (!arcs.has(from)) arcs.set(from, new Map());
                if (!arcs.get(from)!.has(to)) arcs.get(from)!.set(to, []);
                arcs.get(from)!.get(to)!.push(action);
            }
        }
    }

    return [...arcs.entries()].flatMap(([from, tos]) =>
        [...tos.entries()].map(([to, actions]) => ({from, to, actions}))
    );
}
