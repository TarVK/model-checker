import {getTheme, Label, Stack, StackItem} from "@fluentui/react";
import {getFormulaText} from "model-checker";
import {useDataHook, useMemoDataHook} from "model-react";
import React, {FC, useEffect} from "react";
import {Formula} from "../../model/Formula";
import {customTheme, formulaLanguage} from "../editor/CustomLanguageMonacoDefinition";
import {useEditor} from "../editor/useEditor";

const theme = getTheme();
export const FormulaStats: FC<{formula: Formula}> = ({formula}) => {
    const [simplifiedFormulaText] = useMemoDataHook(h => {
        const formulaAST = formula.getSimplifiedFormula(h);
        if (!formulaAST) return "";
        return getFormulaText(formulaAST);
    }, []);

    const [editor, editorRef] = useEditor({
        value: simplifiedFormulaText,
        height: "100%",
        options: {
            readOnly: true,
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
            wordWrap: "on",
        },
    });

    useEffect(() => {
        const editor = editorRef.current;
        if (editor && editor.getValue() != simplifiedFormulaText)
            editor.setValue(simplifiedFormulaText);
    }, [simplifiedFormulaText]);

    const [h] = useDataHook();
    const depth = formula.getDepth(h);
    const alternationDepth = formula.getAlternationDepth(h);
    const dependentAlternationDepth = formula.getDependentAlternationDepth(h);
    const alternationErrors = formula.getOddNegations(h);

    return (
        <>
            <Stack horizontal tokens={{childrenGap: theme.spacing.m}}>
                <StackItem grow={1}>
                    <Label>Fixpoint depth</Label>
                </StackItem>
                <StackItem style={{minWidth: 20}}>{depth}</StackItem>
            </Stack>
            <Stack horizontal tokens={{childrenGap: theme.spacing.m}}>
                <StackItem grow={1}>
                    <Label>Fixpoint alternation depth</Label>
                </StackItem>
                <StackItem style={{minWidth: 20}}>{alternationDepth}</StackItem>
            </Stack>
            <Stack horizontal tokens={{childrenGap: theme.spacing.m}}>
                <StackItem grow={1}>
                    <Label>Fixpoint dependent alternation depth</Label>
                </StackItem>
                <StackItem style={{minWidth: 20}}>{dependentAlternationDepth}</StackItem>
            </Stack>

            <Label>Simplified formula</Label>
            <div
                style={{
                    width: 500,
                    height: 300,
                    overflowX: "visible",
                }}>
                {alternationErrors.size == 0 && editor}
            </div>
        </>
    );
};
