import P, {Parser} from "parsimmon";
import {IEActions, IEActionSequence, IExtendedFormulaAST} from "../../_types";
import {wrap} from "../wrap";
import {createOpParser} from "./createOpParser";

// const actionParser = P.regex(/[a-z][a-z0-9_\-]*/);
const variableTextParser = wrap(P.regex(/[a-zA-Z0-9]+/));

export const actionParser: Parser<IEActions> = P.lazy(() =>
    createOpParser<IEActions>()
        .a({
            t: "b",
            p: 10,
            op: wrap(
                P.seq(P.string("("), actionParser, P.string(")")).map(
                    ([, action]) => action
                )
            ),
        })
        .a({
            t: "b",
            p: 10,
            op: wrap(P.string("true")).map(() => ({type: "any"} as const)),
        })
        .a({
            t: "b",
            p: 10,
            op: wrap(P.string("false")).map(
                () => ({type: "complement", actions: {type: "any"}} as const)
            ),
        })
        .a({
            t: "b",
            p: 10,
            op: wrap(P.regex(/[a-z][a-z0-9_\-]*/)).map(
                action => ({type: "baseAction", action} as const)
            ),
        })
        .a({
            t: "p",
            p: 10,
            op: P.seq(wrap(P.string("!"))).map(
                () => actions => ({type: "complement", actions} as const)
            ),
        })
        .a({
            t: "i",
            p: 7,
            ass: "right",
            op: wrap(P.string("&&")).map(
                () => (left, right) => ({type: "intersection", left, right} as const)
            ),
        })
        .a({
            t: "i",
            p: 6,
            ass: "right",
            op: wrap(P.string("||")).map(
                () => (left, right) => ({type: "union", left, right} as const)
            ),
        })
        .finish()
);

export const actionSeqParser: Parser<IEActionSequence> = P.lazy(() =>
    createOpParser<IEActionSequence>()
        .a({
            t: "b",
            p: 10,
            op: actionParser.map(actions => ({type: "actionSet", actions} as const)),
        })
        .a({
            t: "b",
            p: 10,
            op: wrap(
                P.seq(P.string("("), actionSeqParser, P.string(")")).map(
                    ([, action]) => action
                )
            ),
        })
        .a({
            t: "s",
            p: 9,
            op: wrap(P.string("*")).map(
                () => repeat => ({type: "repeat0", repeat} as const)
            ),
        })
        .a({
            t: "s",
            p: 9,
            op: wrap(P.string("+"))
                .notFollowedBy(actionSeqParser)
                .map(() => repeat => ({type: "repeat1", repeat} as const)),
        })
        .a({
            t: "i",
            p: 8,
            ass: "right",
            op: wrap(P.string(".")).map(
                () => (first, last) => ({type: "sequence", first, last} as const)
            ),
        })
        .a({
            t: "i",
            p: 8,
            ass: "right",
            op: wrap(P.string("+")).map(
                () => (left, right) => ({type: "or", left, right} as const)
            ),
        })
        .finish()
);

export const formulaParser: Parser<IExtendedFormulaAST> = P.lazy(() =>
    createOpParser<IExtendedFormulaAST>()
        .a({
            t: "b",
            p: 10,
            op: wrap(P.string("true").map(() => ({type: "true"} as const))),
        })
        .a({
            t: "b",
            p: 10,
            op: wrap(P.string("false").map(() => ({type: "false"} as const))),
        })
        .a({
            t: "b",
            p: 10,
            op: wrap(
                P.seq(P.string("("), formulaParser, P.string(")")).map(
                    ([, formula]) => formula
                )
            ),
        })

        // Prefix operators
        .a({
            t: "p",
            p: 10,
            op: P.seq(wrap(P.string("!"))).map(
                () => formula => ({type: "negate", formula} as const)
            ),
        })
        .a({
            t: "p",
            p: 10,
            op: wrap(
                P.seq(P.string("["), actionSeqParser, P.string("]")).map(
                    ([_1, action, _2]) =>
                        formula =>
                            ({type: "forall", action, formula} as const)
                )
            ),
        })
        .a({
            t: "p",
            p: 10,
            op: wrap(
                P.seq(P.string("<"), actionSeqParser, P.string(">")).map(
                    ([_1, action, _2]) =>
                        formula =>
                            ({type: "exists", action, formula} as const)
                )
            ),
        })

        .a({
            t: "p",
            p: 10,
            op: wrap(
                P.seq(P.string("mu"), variableTextParser, P.string(".")).map(
                    ([_1, variable, _2]) =>
                        formula =>
                            ({type: "leastFixpoint", variable, formula} as const)
                )
            ),
        })
        .a({
            t: "p",
            p: 10,
            op: wrap(
                P.seq(P.string("nu"), variableTextParser, P.string(".")).map(
                    ([_1, variable, _2]) =>
                        formula =>
                            ({type: "greatestFixpoint", variable, formula} as const)
                )
            ),
        })

        // Variable (no priorly known prefix)
        .a({
            t: "b",
            p: 10,
            op: variableTextParser.map(name => ({type: "variable", name} as const)),
        })

        // Binary operators
        .a({
            t: "i",
            p: 7,
            ass: "right",
            op: wrap(P.string("&&")).map(
                () => (left, right) => ({type: "conjunction", left, right} as const)
            ),
        })
        .a({
            t: "i",
            p: 6,
            ass: "right",
            op: wrap(P.string("||")).map(
                () => (left, right) => ({type: "disjunction", left, right} as const)
            ),
        })
        .a({
            t: "i",
            p: 5,
            ass: "right",
            op: wrap(P.string("=>")).map(
                () => (premise, conclusion) =>
                    ({type: "implies", premise, conclusion} as const)
            ),
        })
        .finish()
);
