import {getTheme} from "@fluentui/react";
import {useDataHook} from "model-react";
import React, {FC} from "react";
import {failsColor, satisfiesColor} from "../../../../colors";
import {State} from "../../../../model/State";
import {LTSGraphState} from "../LTSGraphState";

const theme = getTheme();
export const radius = 14;
export const Node: FC<{editorState: LTSGraphState; node: number}> = ({
    editorState,
    node,
}) => {
    const [h] = useDataHook();
    const {LTSState} = editorState;
    const pos = LTSState.getStatePos(node, h);

    const selection = editorState.getSelection(h);
    const selected = selection?.type == "node" && selection.node == node;

    const shownFormula = LTSState.getShownFormula(h);
    const satisfies = shownFormula?.getResult(h)?.satisfyingStates.has(node);
    const notSatisfies = shownFormula?.getResult(h) && !satisfies;

    return (
        <g id={`${node}`}>
            <circle
                style={{
                    fill: satisfies
                        ? satisfiesColor
                        : notSatisfies
                        ? failsColor
                        : "white",
                    stroke: selected ? theme.palette.themePrimary : "#000",
                    strokeWidth: 1,
                    strokeMiterlimit: 40,
                    cursor:
                        editorState.getSelectedTool(h) != "add" ? "pointer" : "default",
                }}
                cx={pos.x}
                cy={-pos.y}
                r={radius}></circle>
            <text x={pos.x} y={-pos.y} fontSize={15} textAnchor="middle" dy=".3em">
                {node}
            </text>
        </g>
    );
};
