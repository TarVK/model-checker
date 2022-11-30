import p, {Parser} from "parsimmon";
import {IFormulaAST} from "../_types";
import {wrap} from "./util";

const actionParser = p.regex(/[a-z][a-z0-9_\-]*/);
const variableTextParser = wrap(p.regex(/[a-zA-Z]+/));

export const formulaParser: Parser<IFormulaAST> = p.lazy(() =>
    p.alt(
        trueParser,
        falseParser,
        conjunctionParser,
        disjunctionParser,
        existsParser,
        forallParser,
        leastFixpointParser,
        greatestFixpointParser,
        variableParser
    )
);

export const trueParser = wrap(p.string("true").map(() => ({type: "true"} as const)));
export const falseParser = wrap(p.string("false").map(() => ({type: "false"} as const)));
export const variableParser = variableTextParser.map(
    name => ({type: "variable", name} as const)
);
export const conjunctionParser = wrap(
    p
        .seq(p.string("("), formulaParser, p.string("&&"), formulaParser, p.string(")"))
        .map(([_1, left, _2, right, _3]) => ({type: "conjunction", left, right} as const))
);
export const disjunctionParser = wrap(
    p
        .seq(p.string("("), formulaParser, p.string("||"), formulaParser, p.string(")"))
        .map(([_1, left, _2, right, _3]) => ({type: "disjunction", left, right} as const))
);
export const existsParser = wrap(
    p
        .seq(p.string("<"), actionParser, p.string(">"), formulaParser)
        .map(([_1, action, _2, formula]) => ({type: "exists", action, formula} as const))
);
export const forallParser = wrap(
    p
        .seq(p.string("["), actionParser, p.string("]"), formulaParser)
        .map(([_1, action, _2, formula]) => ({type: "forall", action, formula} as const))
);
export const leastFixpointParser = wrap(
    p
        .seq(p.string("mu "), variableTextParser, p.string("."), formulaParser)
        .map(
            ([_1, variable, _2, formula]) =>
                ({type: "leastFixpoint", variable, formula} as const)
        )
);
export const greatestFixpointParser = wrap(
    p
        .seq(p.string("nu "), variableTextParser, p.string("."), formulaParser)
        .map(
            ([_1, variable, _2, formula]) =>
                ({type: "greatestFixpoint", variable, formula} as const)
        )
);
