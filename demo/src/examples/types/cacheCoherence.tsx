import {
    Dropdown,
    getTheme,
    Label,
    Stack,
    StackItem,
    TextField,
    Toggle,
} from "office-ui-fabric-react";
import React, {FC, MutableRefObject, useCallback, useState} from "react";
import {InlineTex, Tex} from "react-tex";
import {Literal} from "../../components/Literal";
import {genList} from "../../util/genList";
import {IModelData} from "../../_types/IModelData";
import {getRemoteLTS} from "../getRemoteLts";
import {br} from "../latex";

const theme = getTheme();
export const cacheCoherence = {
    name: "Cache coherence",
    Comp: ({getCode}: {getCode: MutableRefObject<() => Promise<IModelData>>}) => {
        const [count, setCount] = useState(2);

        getCode.current = useCallback(
            async () => ({
                modelText: await getRemoteLTS(
                    `cacheCoherence/german_linear_${count}.1.aut`
                ),
                formulas: [
                    {
                        name: "Infinite run no access",
                        description: "",
                        formula: `nu X. (
    <i>X
    ||
        (          
        <req_exclusive>X
        ||
        <req_shared>X
        )
    )
`,
                    },
                    {
                        name: "Infinitely often exclusive",
                        description: "",
                        formula: `nu X. mu Y. ( <exclusive>X
                    ||
                    (
                    <i>Y
                    ||
                        (                    
                        <req_exclusive>Y
                        ||
                            (
                            <req_shared>Y
                            ||
                            <shared>Y
                            )
                        )
                    )
                )
`,
                    },
                    {
                        name: "invariantly eventually fair shared access",
                        description: "",
                        formula: `nu X. (
    [i]X
    &&
        (
        [req_exclusive]X
        &&
            (
            [exclusive]X
            &&
                (
                    [shared]X
                    &&
                    [req_shared]nu Y. (
                                        [i]Y
                                        &&
                                            (
                                            [req_exclusive]Y
                                            &&
                                                (
                                                [exclusive]Y
                                                &&
                                                    (
                                                        [req_shared]Y
                                                        &&
                                                        mu Z. (
                                                                <i>Z
                                                                ||
                                                                    (                    
                                                                    <req_exclusive>Z
                                                                    ||
                                                                        (
                                                                        <req_shared>Z
                                                                        ||
                                                                            (
                                                                            <exclusive>Z
                                                                            ||
                                                                            <shared>true
                                                                            )
                                                                        )
                                                                    )
                                                                )
                                                        )
                                                    )
                                                )
                                            )
                        )
                    )
                )
            )
                `,
                    },
                    {
                        name: "Invariantly inevitable exclusive access",
                        description: "",
                        formula: `nu X. (
    [i]X
    &&
        (
        [req_exclusive]X
        &&
            (
            [req_shared]X
            &&
                (
                [exclusive]X
                &&
                    (
                        [shared]X
                        &&
                        [req_exclusive]mu Y. (
                                                [i]Y
                                                &&
                                                    (                    
                                                    [req_exclusive]Y                    
                                                    &&
                                                        (
                                                        [req_shared]Y
                                                        &&
                                                        [shared]Y
                                                        )
                                                    )                    
                                                )
                    )
                )
            )
        )
    )
                `,
                    },
                    {
                        name: "Invariantly possibly exclusive access",
                        description: "",
                        formula: `nu X. (
    [i]X
    &&
        (
        [req_exclusive]X
        &&
            (
            [req_shared]X
            &&
                (
                [exclusive]X
                &&
                    (
                        [shared]X
                        &&
                        [req_exclusive]mu Y. (
                                                <i>Y
                                                ||
                                                    (                    
                                                    <req_exclusive>Y
                                                    ||
                                                        (
                                                        <req_shared>Y
                                                        ||
                                                            (
                                                            <shared>Y
                                                            ||
                                                            <exclusive>true
                                                            )
                                                        )
                                                    )                    
                                                )
                    )
                )
            )
        )
    )
                `,
                    },
                ],
                simplified: true,
            }),
            [count]
        );

        return (
            <>
                <p style={{clear: "both"}}>
                    Note that this problem scales exponentially, so the 5 clients model is
                    very large and will not run well at all!
                    <Dropdown
                        placeholder="Client count"
                        label="Client count"
                        options={new Array(4).fill(null).map((_, i) => {
                            const v = i + 2;
                            return {
                                key: v,
                                text: v + "",
                                data: v,
                                selected: count == v,
                            };
                        })}
                        onChange={(e, option) => {
                            option && setCount(option.data);
                        }}
                    />
                </p>
            </>
        );
    },
};
