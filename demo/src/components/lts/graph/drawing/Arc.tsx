import {getTheme} from "@fluentui/react";
import {Field, useDataHook} from "model-react";
import React, {FC} from "react";
import {State} from "../../../../model/State";
import {getDistance} from "../util/getDistance";
import {LTSGraphState} from "../LTSGraphState";
import {radius} from "./Node";
import {IPoint} from "../../../../_types/IPoint";

const theme = getTheme();
export const Arc: FC<{
    editorState: LTSGraphState;
    from: number;
    to: number | Field<IPoint>;
    toDelta?: number;
}> = ({editorState, from, to, toDelta = radius + 2}) => {
    const [h] = useDataHook();
    const {LTSState} = editorState;

    const selection = editorState.getSelection(h);
    const arcSelected =
        selection?.type == "arc" && selection.from == from && selection.to == to;
    const stroke = arcSelected ? theme.palette.themePrimary : "#000";
    const head = arcSelected ? "url(#headSelected)" : "url(#head)";

    const fromPos = LTSState.getStatePos(from, h);
    const toPos = typeof to == "number" ? LTSState.getStatePos(to, h) : to.get(h);
    const length = getDistance(fromPos, toPos);
    if (length == 0) {
        return (
            <path
                id={`${from}-${to}`}
                markerEnd={head}
                strokeWidth={2}
                fill="none"
                stroke={stroke}
                d={`M${radius + fromPos.x},${-fromPos.y} A ${radius},${radius} 270 1 1 ${
                    toPos.x
                },${radius + 2 - toPos.y}`}
            />
        );
    }

    const dir = {
        x: (toPos.x - fromPos.x) / length,
        y: (toPos.y - fromPos.y) / length,
    };
    const fromOffset = {
        x: fromPos.x + dir.x * radius,
        y: fromPos.y + dir.y * radius,
    };
    const toOffset = {
        x: toPos.x - dir.x * toDelta,
        y: toPos.y - dir.y * toDelta,
    };

    return (
        <path
            id={`${from}-${to}`}
            markerEnd={head}
            strokeWidth={2}
            fill="none"
            stroke={stroke}
            d={`M${fromOffset.x},${-fromOffset.y} ${toOffset.x},${-toOffset.y}`}
        />
    );
};
