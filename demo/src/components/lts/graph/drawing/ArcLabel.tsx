import {getTheme} from "@fluentui/react";
import {useDataHook} from "model-react";
import React, {FC} from "react";
import {LTSGraphState} from "../LTSGraphState";
import {radius} from "./Node";

export const ArcLabel: FC<{
    editorState: LTSGraphState;
    from: number;
    to: number;
    actions: string[];
}> = ({editorState, from, to, actions}) => {
    const theme = getTheme();
    const [h] = useDataHook();
    const {LTSState} = editorState;

    const selection = editorState.getSelection(h);
    const arcSelected =
        selection?.type == "arc" && selection.from == from && selection.to == to;

    const fromPos = LTSState.getStatePos(from, h);
    const toPos = LTSState.getStatePos(to, h);

    const f = 0.65;
    const center = {
        x: fromPos.x * (1 - f) + toPos.x * f,
        y: fromPos.y * (1 - f) + toPos.y * f,
    };

    if (fromPos.x == toPos.x && fromPos.y == toPos.y) {
        center.x = fromPos.x + radius * 1.8;
        center.y = fromPos.y - radius * 1.8;
    }

    const fontSize = 15;
    return (
        <text
            id={`${from}-${to}-label`}
            x={center.x}
            y={-center.y}
            fontSize={fontSize}
            textAnchor="middle"
            dy=".3em"
            style={{
                paintOrder: "stroke",
                stroke: "white",
                strokeWidth: 4,
                strokeLinecap: "butt",
                strokeLinejoin: "miter",
            }}>
            {actions.map((line, i) => (
                <tspan
                    dy={i == 0 ? (-(actions.length - 1) / 2) * fontSize : fontSize}
                    key={line}
                    x={center.x}
                    style={{
                        fill:
                            arcSelected && selection.action == line
                                ? theme.palette.themePrimary
                                : "#000",
                    }}
                    onClick={() => {
                        if (editorState.getSelectedTool() == "select") {
                            const c = editorState.getSelection();
                            const isSelected =
                                c?.type == "arc" &&
                                c.from == from &&
                                c.to == to &&
                                c.action == line;
                            if (isSelected)
                                editorState.setEditingArc({
                                    from,
                                    to,
                                    action: line,
                                });
                            else
                                editorState.setSelection({
                                    type: "arc",
                                    from,
                                    to,
                                    action: line,
                                });
                        }
                    }}>
                    {line}
                </tspan>
            ))}
        </text>
    );
};
