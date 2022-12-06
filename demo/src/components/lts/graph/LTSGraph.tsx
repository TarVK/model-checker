import {Field, useDataHook} from "model-react";
import React, {FC, useCallback, useEffect, useRef, useState} from "react";
import {State} from "../../../model/State";
import {getDistance} from "./util/getDistance";
import {EditorPlane} from "./grid/EditorPlane";
import {IInteractionHandler} from "./grid/_types/IInteractionHandler";
import {LTSGraphState} from "./LTSGraphState";
import {radius} from "./drawing/Node";
import {Shapes} from "./drawing/Shapes";
import {LTSCodeEditor} from "./LTSCodeEditor";
import {GraphEditorToolbar} from "./toolbar/GraphEditorToolbar";
import {mergeStyles, TextField} from "@fluentui/react";
import {useLazyRef} from "../../../util/useLazyRef";
import {IPoint} from "../../../_types/IPoint";
import {StandardModal} from "../../Modal";
import {Arc} from "./drawing/Arc";

export const LTSGraph: FC<{editorState: LTSGraphState}> = ({editorState}) => {
    const [h] = useDataHook();
    const {LTSState: state} = editorState;

    const dragging = useRef(false);

    const arcStartNodeRef = useRef<null | number>(null);
    const [arcStartNode, setArcStartNode] = useState<null | number>(null);
    const [arcEndNode, setArcEndNode] = useState<null | number>(null);
    const mousePos = useRef(new Field<IPoint>({x: 0, y: 0}));
    const [arcText, setArcText] = useState("");

    const editingArc = editorState.getEditingArc(h);
    useEffect(() => {
        if (editingArc) setArcText(editingArc.action ?? "");
    }, [editingArc]);

    const editingTool = editorState.getSelectedTool(h) == "select";
    useEffect(() => {
        if (!editingTool) editorState.setSelection(null);
    }, [editingTool]);

    const getNode = useCallback(
        (point: IPoint): number | null => {
            const states = state.getStates();
            for (let s of states) {
                const dist = getDistance(point, state.getStatePos(s));
                if (dist < radius) return s;
            }
            return null;
        },
        [state]
    );
    const onMouseDown = useCallback<IInteractionHandler>(
        (evt, point) => {
            if (evt.button != 0) return;

            const tool = editorState.getSelectedTool();
            if (tool == "select") {
                const s = getNode(point);
                if (s != null) {
                    editorState.setSelection({type: "node", node: s});
                    dragging.current = true;
                }
            } else if (tool == "add") {
                const snappedPoint = editorState.snap(point);
                state.addState(snappedPoint);
            } else if (tool == "connect") {
                const s = getNode(point);
                arcStartNodeRef.current = s;
                setArcStartNode(s);
            }

            evt.preventDefault();
            evt.stopPropagation();
        },
        [state]
    );

    const onMouseUp = useCallback<IInteractionHandler>(
        (evt, point) => {
            dragging.current = false;

            const tool = editorState.getSelectedTool();
            if (tool == "connect") {
                const to = getNode(point);

                const from = arcStartNodeRef.current;
                if (from == null || to == null) {
                    setArcEndNode(null);
                    setArcStartNode(null);
                    return;
                }
                editorState.setEditingArc({to, from, action: null});
                setArcEndNode(to);
            } else {
                setArcEndNode(null);
                setArcStartNode(null);
            }
        },
        [state]
    );

    const onMouseMove = useCallback<IInteractionHandler>(
        (evt, point, delta) => {
            mousePos.current.set(point);
            if (dragging.current) {
                const selection = editorState.getSelection();
                if (selection?.type == "node") {
                    const snappedPoint = editorState.snap(point);
                    state.setStatePos(selection.node, snappedPoint);
                }
            }
            evt.preventDefault();
        },
        [state]
    );

    const onMouseLeave = useCallback(() => {
        dragging.current = false;
    }, [state]);

    const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key == "d" || event.key == "Delete") {
                const selection = editorState.getSelection();
                if (!selection) return;
                if (selection.type == "node") {
                    state.removeState(selection.node);
                } else {
                    state.removeTransition(
                        selection.from,
                        selection.to,
                        selection.action
                    );
                }
            }
            if (event.key == "e") editorState.setSelectedTool("select");
            if (event.key == "a") editorState.setSelectedTool("add");
            if (event.key == "c") editorState.setSelectedTool("connect");
        },
        [state]
    );

    const updateArc = () => {
        if (editingArc) {
            if (editingArc.action)
                state.removeTransition(editingArc.from, editingArc.to, editingArc.action);
            if (arcText) state.addTransition(editingArc.from, editingArc.to, arcText);
        }
        editorState.setEditingArc(null);
        setArcStartNode(null);
        setArcEndNode(null);
    };

    return (
        <div
            className={style}
            style={{
                width: "100%",
                height: "100%",
                background: "white",
            }}>
            <GraphEditorToolbar state={editorState} />
            <div className="content">
                <LTSCodeEditor state={editorState} />
                <EditorPlane
                    width={"auto"}
                    height={"100%"}
                    state={editorState}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onKeyDown={onKeyDown}
                    onMouseLeave={onMouseLeave}>
                    <Shapes state={editorState}>
                        {arcStartNode != null && (
                            <Arc
                                editorState={editorState}
                                from={arcStartNode}
                                to={arcEndNode ? arcEndNode : mousePos.current}
                                toDelta={arcEndNode ? undefined : 0}
                            />
                        )}
                    </Shapes>
                </EditorPlane>
            </div>

            <StandardModal
                title="Edit arc action"
                visible={!!editingArc}
                onClose={updateArc}>
                <TextField
                    underlined
                    value={arcText}
                    onChange={(e, v) => v != null && setArcText(v)}
                    autoFocus
                    onKeyDown={evt => {
                        if (evt.key == "Enter") updateArc();
                        evt.stopPropagation();
                    }}
                    label="Action"
                />
            </StandardModal>
        </div>
    );
};

const style = mergeStyles({
    display: "flex",
    flexDirection: "column",
    ".plane": {
        flexGrow: 1,
    },
    ".content": {
        display: "flex",
        flex: 1,
        minHeight: 0,
    },
    ".codeEditor": {
        boxShadow: "rgb(0 0 0 / 25%) 3px 0px 10px 0px",
        // Cut off the box shadow at the top
        clipPath: "polygon(0 0, 0px 10000px, 10000px 10000px, 10000px 0px)",
    },
    ".toolbar": {
        boxShadow: "rgb(0 0 0 / 25%) 0px 3px 10px 0px",
    },
});
