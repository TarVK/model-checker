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

const theme = getTheme();
export const App: FC = () => {
    const state = useLazyRef(() => {
        const state = new State();
        return state;
    }).current;

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
                            onLoad={({modelText, formulas, statePoses}) => {
                                state.setLTS(modelText);
                                state.clearPoses();
                                state
                                    .getFormulas()
                                    .forEach(formula => state.removeFormula(formula));
                                [...formulas].reverse().forEach(({name, text}) => {
                                    const formula = state.addFormula();
                                    formula.setName(name);
                                    formula.setFormula(text);
                                });
                                Object.entries(statePoses).forEach(([s, pos]) =>
                                    state.setStatePos(Number(s), pos)
                                );
                                state.layout();
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
                            <LTSGraph state={state} />
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