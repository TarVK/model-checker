import {useDataHook} from "model-react";
import React, {FC, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useWindowSize} from "../../../../util/useWindowSize";
import {IPoint} from "../../../../_types/IPoint";
import {Arc} from "./Arc";
import {ArcLabel} from "./ArcLabel";
import {getTransitions} from "../util/getTransitions";
import {LTSGraphState} from "../LTSGraphState";
import {Node} from "./Node";

export const Shapes: FC<{state: LTSGraphState}> = ({state}) => {
    const [h] = useDataHook();
    const [size, setSize] = useState<IPoint>({x: 0, y: 0});
    const containerRef = useRef<SVGElement>();

    const setContainer = useCallback((container: SVGElement | null) => {
        if (container) {
            const rect = container.getBoundingClientRect();
            setSize({x: rect.width, y: rect.height});
            containerRef.current = container;
        }
    }, []);

    const editorShown = state.isCodeEditorVisible(h);
    const windowSize = useWindowSize();
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const update = () => {
            const rect = container.getBoundingClientRect();
            setSize({x: rect.width, y: rect.height});
        };
        update();
        setTimeout(update); // Requires rerender first
    }, [windowSize, editorShown]);

    const {scale, offset} = state.getTransformation(h);
    const ltsState = state.LTSState;
    const lts = ltsState.getLTS(h);
    const transitions = useMemo(() => (lts ? getTransitions(lts) : []), [lts]);

    return (
        <svg
            style={{position: "absolute"}}
            width="100%"
            height="100%"
            ref={setContainer}
            viewBox={`${-offset.x / scale - size.x / scale / 2} ${
                offset.y / scale - size.y / scale / 2
            } ${size.x / scale} ${size.y / scale}`}>
            <defs>
                <marker
                    id="head"
                    orient="auto"
                    markerWidth={5}
                    markerHeight={6}
                    refX={1}
                    refY={2}>
                    <path d="M0,0 V4 L2,2 Z" fill="black" />
                </marker>
            </defs>

            {transitions.map(({to, from, actions}) => (
                <Arc key={`${from}-${to}`} editorState={state} from={from} to={to} />
            ))}
            {ltsState.getStates(h).map(stateID => (
                <Node key={stateID} editorState={state} node={stateID} />
            ))}

            {transitions.map(({to, from, actions}) => (
                <ArcLabel
                    key={`${from}-${to}`}
                    editorState={state}
                    from={from}
                    to={to}
                    actions={actions}
                />
            ))}
        </svg>
    );
};
