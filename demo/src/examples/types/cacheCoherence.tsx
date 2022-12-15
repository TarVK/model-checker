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
                        formula: `nu X. <!(exclusive || shared)>X`,
                    },
                    {
                        name: "Infinitely often exclusive",
                        description: "",
                        formula: `nu X. <(!exclusive)*.exclusive>X`,
                    },
                    {
                        name: "invariantly eventually fair shared access",
                        description: "",
                        formula: `[(!req_shared)*.req_shared.(!shared)*]<(!shared)*.shared>true`,
                    },
                    {
                        name: "Invariantly inevitable exclusive access",
                        description: "",
                        formula: `[true*.req_exclusive]!nu Y. <!exclusive>Y`,
                    },
                    {
                        name: "Invariantly possibly exclusive access",
                        description: "",
                        formula: `[true*.req_exclusive]<(!exclusive)*.exclusive>true`,
                    },
                ],
                simplified: true,
            }),
            [count]
        );

        return (
            <>
                Cache coherence is the problem of dealing with caching in a setting where
                multiple clients modify the same resource, and have layers of cache on top
                of the resource. Data may accidentally (temporarily) be written to cache
                only and not be available to the other clients. Steven German specified a
                protocol that deals with this problem, which can be modelled using a LTS.
                <p style={{clear: "both"}}>
                    Note that these models contain many states, so the 5 clients model is
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
