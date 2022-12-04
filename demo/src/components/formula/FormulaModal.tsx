import React, {FC, useEffect, useState} from "react";
import {Formula} from "../../model/Formula";
import {
    DefaultButton,
    getTheme,
    Modal,
    Pivot,
    TextField,
    Dropdown,
    Stack,
    StackItem,
} from "office-ui-fabric-react";
import {useDataHook} from "model-react";
import {StandardModal} from "../Modal";
import {useEditor} from "../editor/useEditor";
import {useAnnotationRemover} from "../editor/useAnnotationsRemover";
import {useErrorHighlighter} from "../editor/useErrorHighlighter";
import {customTheme, formulaLanguage} from "../editor/CustomLanguageMonacoDefinition";
import {IVerifyAlgoritm} from "../../_types/IVerifyAlgoritm";

const theme = getTheme();
export const FormulaModal: FC<{
    formula: Formula;
    visible: boolean;
    onClose: () => void;
}> = ({formula, visible, onClose}) => {
    const [h] = useDataHook();
    const [editor, editorRef] = useEditor({
        value: formula.getFormulaText(),
        height: "100%",
        options: {
            language: formulaLanguage,
            theme: customTheme,
            minimap: {enabled: false},
            scrollbar: {useShadows: false},
            lineNumbers: "off",
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            scrollBeyondLastLine: false,
        },
    });

    useAnnotationRemover(editorRef.current);
    useErrorHighlighter(() => formula.getFormulaErrors(), editorRef);

    useEffect(() => {
        const editor = editorRef.current;
        if (editor) {
            const disposable = editor.onDidChangeModelContent(() => {
                formula.setFormula(editor.getValue());
            });

            return () => disposable?.dispose();
        }
    }, [editorRef.current]);

    const formulaText = formula.getFormulaText(h);
    useEffect(() => {
        const editor = editorRef.current;
        if (editor && editor.getValue() != formulaText) editor.setValue(formulaText);
    }, [formulaText]);

    const algorithm = formula.getAlgoritm(h);
    return (
        <StandardModal title="Edit formula" visible={visible} onClose={onClose}>
            <Stack horizontal gap={theme.spacing.m}>
                <StackItem grow={1} style={{minWidth: 150}}>
                    <TextField
                        underlined
                        value={formula.getName(h)}
                        onChange={(e, v) => v != null && formula.setName(v)}
                        label="Name"
                    />
                </StackItem>
                <StackItem grow={1}>
                    <Dropdown
                        placeholder="Select an option"
                        // label="Solver"
                        options={[
                            {
                                key: "0",
                                data: "naive" as IVerifyAlgoritm,
                                text: "Naive",
                                selected: algorithm == "naive",
                            },
                            {
                                key: "1",
                                data: "EmersonLei" as IVerifyAlgoritm,
                                text: "EmersonLei",
                                selected: algorithm == "EmersonLei",
                            },
                        ]}
                        onChange={(e, option) => {
                            option && formula.setAlgoritm(option.data);
                        }}
                    />
                </StackItem>
            </Stack>
            <div
                style={{
                    width: 500,
                    height: 400,
                    marginTop: theme.spacing.m,
                    overflowX: "visible",
                }}>
                {editor}
            </div>
        </StandardModal>
    );
};
