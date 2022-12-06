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
export const fixpointTest = {
    name: "Fixpoint",
    Comp: ({getCode}: {getCode: MutableRefObject<() => Promise<IModelData>>}) => {
        getCode.current = useCallback(
            async () => ({
                modelText: `des(0, 20, 21)
                (0, "a", 6)
                (6, "a", 5)
                (5, "a", 4)
                (4, "a", 3)
                (3, "a", 2)
                (2, "a", 1)
                (1, "a", 0)
                (7, "b", 8)
                (8, "b", 9)
                (9, "b", 10)
                (1, "a", 7)
                (10, "b", 11)
                (11, "b", 12)
                (12, "b", 10)
                (2, "a", 13)
                (9, "b", 14)
                (14, "b", 15)
                (15, "a", 9)
                (18, "c", 16)
                (16, "c", 20)
                (20, "c", 17)
                (20, "c", 0)`,
                formulas: [
                    {
                        name: "a 'b' cycle can be reached using 'a's",
                        formula: "mu X. (<a>X || nu Y. <b>Y)",
                    },
                    {
                        name: "a 'b' cycle can be reached using 'c's followed by 'a's",
                        formula: "mu Z. (<c>Z || mu X. (<a>X || nu Y. <b>Y))",
                    },
                    {
                        name: "a 'b' cycle can be reached using 'c's followed by 'a's (naive)",
                        formula: "mu Z. (<c>Z || mu X. (<a>X || nu Y. <b>Y))",
                        algorithm: "naive",
                    },
                ],
                statePoses: {},
            }),
            []
        );

        return <>Some tests comparing naive and EmersonLei fixpoint approaches</>;
    },
};
