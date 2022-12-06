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
import {LTSGraph} from "./components/lts/graph/LTSGraph";
import {LTSGraphState} from "./components/lts/graph/LTSGraphState";

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
            <Stack
                styles={{
                    root: {
                        height: "100%",
                        overflow: "hidden",
                        background: theme.palette.neutralLight,
                    },
                }}>
                <StackItem>
                    <Header>
                        <ExampleModal
                            onLoad={async ({modelText, formulas, statePoses}) => {
                                state.setLTS(modelText);
                                state.clearPoses();
                                state
                                    .getFormulas()
                                    .forEach(formula => state.removeFormula(formula));
                                [...formulas]
                                    .reverse()
                                    .forEach(({name, text, algorithm}) => {
                                        const formula = state.addFormula();
                                        formula.setName(name);
                                        formula.setFormula(text);
                                        if (algorithm) formula.setAlgoritm(algorithm);
                                    });
                                Object.entries(statePoses).forEach(([s, pos]) =>
                                    state.setStatePos(Number(s), pos)
                                );
                                await state.layout();
                                editorState.autoPosition();
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
                            <LTSGraph editorState={editorState} />
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
