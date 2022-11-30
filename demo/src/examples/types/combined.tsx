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
export const combined = {
    name: "Combined",
    Comp: ({getCode}: {getCode: MutableRefObject<() => IModelData>}) => {
        getCode.current = useCallback(
            () => ({
                modelText: `des (0,14,8)                                                 
(0,"tau",1)
(0,"tau",2)
(1,"tau",3)
(1,"tau",4)
(2,"tau",5)
(2,"tau",4)
(3,"b",0)
(3,"a",6)
(4,"tau",7)
(4,"tau",6)
(5,"a",0)
(5,"a",7)
(6,"tau",2)
(7,"b",1)
`,
                formulas: [
                    {
                        name: "test",
                        text: "nu X. (<tau>X && mu Y. (<tau>Y || [a]false))",
                    },
                    {
                        name: "bool",
                        text: "(false || true)",
                    },
                    {
                        name: "modal",
                        text: "<b>true",
                    },
                ],
                statePoses: {},
            }),
            []
        );

        return <>Some tests with combined operators</>;
    },
};
