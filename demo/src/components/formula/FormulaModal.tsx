import React, {FC, useEffect, useMemo, useState} from "react";
import {Formula} from "../../model/Formula";
import {
    DefaultButton,
    getTheme,
    Modal,
    Pivot,
    PivotItem,
    TextField,
    Dropdown,
    Stack,
    StackItem,
    MessageBar,
    MessageBarType,
} from "office-ui-fabric-react";
import {useDataHook, useMemoDataHook} from "model-react";
import {StandardModal} from "../Modal";
import {useEditor} from "../editor/useEditor";
import {useAnnotationRemover} from "../editor/useAnnotationsRemover";
import {useErrorHighlighter} from "../editor/useErrorHighlighter";
import {customTheme, formulaLanguage} from "../editor/CustomLanguageMonacoDefinition";
import {IVerifyAlgoritm} from "../../_types/IVerifyAlgoritm";
import {FormulaStats} from "./FormulaStats";
import {useSettledData} from "../../util/useSettledValue";

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
    const syntaxError = useSettledData(formula.getFormulaErrors(h));
    const freeVariablesErrorText = useSettledData(
        useMemoDataHook(h => {
            const freeVariables = formula.getFreeVariables(h);
            if (freeVariables == null || freeVariables.size == 0) return null;
            return `All variables must be bound by a fixpoint, found free variables ${[
                ...freeVariables,
            ]
                .map(variable => `"${variable}"`)
                .join(",")}`;
        }, [])[0]
    );

    const alternationErrorsText = useSettledData(
        useMemoDataHook(h => {
            const alternationErrors = formula.getOddNegations(h);
            if (alternationErrors.size == 0) return null;
            return `Must have a even number of negations between a variable reference and its fixpoint binder, found an odd number for ${[
                ...alternationErrors,
            ]
                .map(variable => `"${variable}"`)
                .join(",")}`;
        }, [])[0]
    );

    return (
        <StandardModal title="Edit formula" visible={visible} onClose={onClose}>
            <Stack horizontal tokens={{childrenGap: theme.spacing.m}}>
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
            <Pivot aria-label="Formula tabs" style={{marginTop: theme.spacing.l1}}>
                <PivotItem headerText="Formula">
                    <div
                        style={{
                            width: 500,
                            height: 400,
                            marginTop: theme.spacing.m,
                            overflowX: "visible",
                        }}>
                        {editor}
                    </div>
                </PivotItem>
                <PivotItem headerText="Stats">
                    <FormulaStats formula={formula} />
                </PivotItem>
            </Pivot>
            {alternationErrorsText && (
                <MessageBar
                    styles={{root: {width: 500, boxSizing: "border-box"}}}
                    dismissButtonAriaLabel="Close"
                    messageBarType={MessageBarType.error}>
                    {alternationErrorsText}
                </MessageBar>
            )}
            {freeVariablesErrorText && (
                <MessageBar
                    styles={{root: {width: 500, boxSizing: "border-box"}}}
                    dismissButtonAriaLabel="Close"
                    messageBarType={MessageBarType.error}>
                    {freeVariablesErrorText}
                </MessageBar>
            )}
            {syntaxError && (
                <MessageBar
                    styles={{root: {width: 500, boxSizing: "border-box"}}}
                    dismissButtonAriaLabel="Close"
                    messageBarType={MessageBarType.error}>
                    {syntaxError.message}
                </MessageBar>
            )}
        </StandardModal>
    );
};
