import React, {FC, useEffect} from "react";
import {getTheme, Stack, StackItem} from "@fluentui/react";
import {State} from "../../../model/State";
import {useEditor} from "../../editor/useEditor";
import {useAnnotationRemover} from "../../editor/useAnnotationsRemover";
import {useDataHook} from "model-react";
import {useErrorHighlighter} from "../../editor/useErrorHighlighter";
import {useLazyRef} from "../../../util/useLazyRef";
import {LTSGraphState} from "../graph/LTSGraphState";
import {LTSGraph} from "../graph/LTSGraph";
import {customTheme, DESLanguage} from "../../editor/CustomLanguageMonacoDefinition";

const theme = getTheme();
export const LTSCodeEditor: FC<{state: LTSGraphState}> = ({state}) => {
    const {LTSState} = state;

    const [editor, editorRef] = useEditor({
        value: LTSState.getLTSText(),
        height: "100%",
        options: {
            minimap: {enabled: false},
            scrollbar: {useShadows: false},
            scrollBeyondLastLine: false,
            language: DESLanguage,
            theme: customTheme,
        },
    });

    useAnnotationRemover(editorRef.current);
    useErrorHighlighter(() => LTSState.getLTSErrors(), editorRef);

    useEffect(() => {
        const editor = editorRef.current;
        if (editor) {
            const disposable = editor.onDidChangeModelContent(() => {
                LTSState.setLTS(editor.getValue());
            });

            return () => disposable?.dispose();
        }
    }, [editorRef.current]);

    const [h] = useDataHook();
    const ltsText = LTSState.getLTSText(h);
    useEffect(() => {
        const editor = editorRef.current;
        if (editor && editor.getValue() != ltsText) editor.setValue(ltsText);
    }, [ltsText]);

    const shown = state.isCodeEditorVisible(h);
    useEffect(() => {
        const editor = editorRef.current;
        if (editor) editor.layout();
    }, [shown]);

    return (
        <Stack
            horizontal
            styles={{
                root: {
                    height: "100%",
                    flex: shown ? 0.9 : 0,
                    width: shown ? "auto" : 0,
                    overflow: "hidden",
                },
            }}>
            <StackItem
                align="stretch"
                grow={1}
                shrink={1}
                styles={{root: {flexBasis: 0, minWidth: 0}}}>
                {editor}
            </StackItem>
        </Stack>
    );
};
