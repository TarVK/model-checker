import {
    Dropdown,
    getTheme,
    Label,
    Stack,
    StackItem,
    TextField,
    Toggle,
} from "office-ui-fabric-react";
import React, {MutableRefObject, useCallback, useState} from "react";
import {InlineTex, Tex} from "react-tex";
import {genList} from "../../util/genList";
import {IModelData} from "../../_types/IModelData";
import {br} from "../latex";

const theme = getTheme();
export const basic = {
    name: "Basic",
    Comp: ({getCode}: {getCode: MutableRefObject<() => Promise<IModelData>>}) => {
        getCode.current = useCallback(
            async () => ({
                modelText: `des(0, 13, 14)
(0, "a", 2)
(2, "a", 3)
(3, "a", 1)
(4, "a", 0)
(5, "a", 4)
(2, "a", 6)
(6, "a", 8)
(6, "b", 7)
(1, "a", 0)
(9, "a", 6)
(5, "a", 13)
(13, "a", 11)
(11, "a", 12)
(12, "a", 13)
(9, "b", 10)
`,
                formulas: [
                    {
                        name: "true",
                        formula: "true",
                    },
                    {
                        name: "false",
                        formula: "false",
                    },
                    {
                        name: "exists a",
                        formula: "<a>true",
                    },
                    {
                        name: "exists a a",
                        formula: "<a><a>true",
                    },
                    {
                        name: "forall a, there is a b",
                        formula: "[a]<b>true",
                        description:
                            "For every state reachable through an 'a' transition, there's a 'b' transition",
                    },
                    {
                        name: "a loop",
                        formula: "nu X. <a>X",
                        description:
                            "Using only a transitions, an 'a' loop can be reached",
                    },
                    {
                        name: "a path to b",
                        formula: "mu X. (<a>X || <b>true)",
                        description: "There is an a path to a 'b' transition",
                    },
                    {
                        name: "infinite a path to b",
                        formula: "nu X. (<a>X || <b>true)",
                        description:
                            "There is a (possibly) infinite 'a' path, or an 'a' path to a 'b'",
                    },
                ],
            }),
            []
        );

        return <>A simple LTS, with some example formulas</>;
    },
};
