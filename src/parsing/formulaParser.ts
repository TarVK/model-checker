import p, {Parser} from "parsimmon";
import {IExtendedFormulaAST} from "../_types/IExtendedFormulaAST";
import {wrap} from "./util";

const actionParser = p.regex(/[a-z][a-z0-9_\-]*/);
const variableTextParser = wrap(p.regex(/[a-zA-Z]+/));

export const formulaParser: Parser<IExtendedFormulaAST> = p.lazy(() =>
    p.alt(
        trueParser,
        falseParser,
        negationParser,
        conjunctionParser,
        disjunctionParser,
        implicationParser,
        existsParser,
        forallParser,
        leastFixpointParser,
        greatestFixpointParser,
        variableParser
    )
);

export const trueParser = wrap(p.string("true").map(() => ({type: "true"} as const)));
export const falseParser = wrap(p.string("false").map(() => ({type: "false"} as const)));
export const negationParser = wrap(
    p
        .seq(p.string("!"), formulaParser)
        .map(([, formula]) => ({type: "negate", formula} as const))
);
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
export const implicationParser = wrap(
    p
        .seq(p.string("("), formulaParser, p.string("=>"), formulaParser, p.string(")"))
        .map(
            ([_1, premise, _2, conclusion, _3]) =>
                ({type: "implies", premise, conclusion} as const)
        )
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
        .seq(p.string("mu"), variableTextParser, p.string("."), formulaParser)
        .map(
            ([_1, variable, _2, formula]) =>
                ({type: "leastFixpoint", variable, formula} as const)
        )
);
export const greatestFixpointParser = wrap(
    p
        .seq(p.string("nu"), variableTextParser, p.string("."), formulaParser)
        .map(
            ([_1, variable, _2, formula]) =>
                ({type: "greatestFixpoint", variable, formula} as const)
        )
);
