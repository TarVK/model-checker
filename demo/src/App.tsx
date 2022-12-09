import {Range, editor as Editor} from "monaco-editor";
import React, {FC, Suspense, useCallback, useEffect, useRef, useState} from "react";
import {Stack, StackItem, getTheme, Dropdown, PrimaryButton} from "@fluentui/react";
import {Header} from "./Header";
import {combineOptions} from "./util/combineOptions";
import {useAnnotationRemover} from "./components/editor/useAnnotationsRemover";
import {ExampleModal} from "./examples/ExampleModal";
import {useLazyRef} from "./util/useLazyRef";
import {State} from "./model/State";
import {FormulaSidebar} from "./components/formula/FormulaSidebar";
import {LTSComp} from "./components/lts/LTSComp";
import {LTSGraphState} from "./components/lts/graph/LTSGraphState";
import {Info} from "./Info";

const theme = getTheme();
export const App: FC = () => {
    const editorState = useLazyRef(() => {
        const state = new State();
        state.setLTS("des(0,0,0)");
        return new LTSGraphState(state);
    }).current;
    const {LTSState: state} = editorState;

    return (
        <div>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css"
            />
            <Stack
                styles={{
                    root: {
                        height: "100%",
                        overflow: "hidden",
                        background: theme.palette.neutralLight,
                    },
                }}>
                <StackItem>
                    <Header info={<Info />}>
                        <ExampleModal
                            onLoad={async ({modelText, formulas, simplified = false}) => {
                                if (simplified) {
                                    editorState.enableSimplifiedView(true);
                                    editorState.setCodeEditorVisible(false);
                                }

                                await new Promise(res => setTimeout(res, 100)); // Add time for a rerender of the simplified view

                                state.setLTS(modelText);
                                state.clearPoses();
                                state
                                    .getFormulas()
                                    .forEach(formula => state.removeFormula(formula));
                                [...formulas]
                                    .reverse()
                                    .forEach(
                                        ({
                                            name,
                                            formula: text,
                                            description,
                                            algorithm,
                                        }) => {
                                            const formula = state.addFormula();
                                            formula.setName(name);
                                            formula.setFormula(text);
                                            formula.setDescription(description ?? "");
                                            if (algorithm) formula.setAlgoritm(algorithm);
                                        }
                                    );

                                if (!simplified) {
                                    await state.layout();
                                    editorState.autoPosition();
                                    editorState.enableSimplifiedView(false);
                                }
                            }}
                        />
                    </Header>
                </StackItem>
                <StackItem grow={1} style={{minHeight: 0, marginTop: theme.spacing.m}}>
                    <Stack horizontal styles={{root: {height: "100%"}}}>
                        <StackItem
                            align="stretch"
                            grow={1}
                            shrink={1}
                            styles={{root: {flexBasis: 0, minWidth: 0}}}>
                            <LTSComp editorState={editorState} />
                        </StackItem>
                        <StackItem
                            style={{
                                marginLeft: theme.spacing.m,
                                minWidth: 200,
                                boxShadow: theme.effects.elevation8,
                                zIndex: 100,
                            }}>
                            <FormulaSidebar state={state} />
                        </StackItem>
                    </Stack>
                </StackItem>
            </Stack>
        </div>
    );
};
