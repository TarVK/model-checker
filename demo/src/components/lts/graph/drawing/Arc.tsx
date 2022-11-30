import {getTheme} from "@fluentui/react";
import {useDataHook} from "model-react";
import React, {FC} from "react";
import {State} from "../../../../model/State";
import {getDistance} from "../util/getDistance";
import {LTSGraphState} from "../LTSGraphState";
import {radius} from "./Node";

const theme = getTheme();
export const Arc: FC<{
    editorState: LTSGraphState;
    from: number;
    to: number;
}> = ({editorState, from, to}) => {
    const [h] = useDataHook();
    const {LTSState} = editorState;

    const selection = editorState.getSelection(h);

    const fromPos = LTSState.getStatePos(from, h);
    const toPos = LTSState.getStatePos(to, h);
    const length = getDistance(fromPos, toPos);
    const dir = {
        x: (toPos.x - fromPos.x) / length,
        y: (toPos.y - fromPos.y) / length,
    };
    const fromOffset = {
        x: fromPos.x + dir.x * radius,
        y: fromPos.y + dir.y * radius,
    };
    const toOffset = {
        x: toPos.x - dir.x * (radius + 2),
        y: toPos.y - dir.y * (radius + 2),
    };

    return (
        <path
            id={`${from}-${to}`}
            marker-end="url(#head)"
            stroke-width={2}
            fill="none"
            stroke="black"
            d={`M${fromOffset.x},${-fromOffset.y} ${toOffset.x},${-toOffset.y}`}
        />
    );
};
