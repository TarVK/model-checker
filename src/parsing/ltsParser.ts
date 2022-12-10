import p from "parsimmon";
import {ILSTAST} from "../_types";
import {wrap} from "./wrap";

const number = wrap(p.regex(/[0-9]+/))
    .map(val => Number(val))
    .desc("number");
const sep = p.string(",");
const action = wrap(
    p
        .regex(/\"[^\"]*\"/)
        .map(text => text.substring(1, text.length - 1))
        .desc("action")
);

export const transitionsParser = wrap(
    p
        .seq(p.string("("), number, sep, action, sep, number, p.string(")"))
        .map(([_1, from, _2, label, _3, to, _4]) => ({from, label, to}))
).many();
export const ltsParser = p
    .seq(
        p
            .seq(
                p.seq(wrap(p.string("des")), wrap(p.string("("))),
                number,
                sep,
                number,
                sep,
                number,
                p.string(")")
            )
            .map(([_1, firstState, _3, transitionCount, _4, stateCount, _5]) => ({
                firstState,
                transitionCount,
                stateCount,
            })),
        transitionsParser
    )
    .map(([data, transitions]) => ({...data, transitions}));

/**
 * Stringifies the given LTS
 * @param lts The labeled transition system to stringify
 * @returns The string representing the LTS
 */
export function stringifyLTS(lts: ILSTAST): string {
    return [
        `des(${lts.firstState}, ${lts.stateCount}, ${lts.transitionCount})`,
        ...lts.transitions.map(({from, to, label}) => `(${from}, "${label}", ${to})`),
    ].join("\n");
}
