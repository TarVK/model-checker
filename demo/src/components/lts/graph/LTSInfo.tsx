import {getTheme, Label, Spinner, Stack, StackItem} from "@fluentui/react";
import {useDataHook, useMemoDataHook} from "model-react";
import React, {ChangeEventHandler, FC, useCallback, useMemo, useState} from "react";
import {State} from "../../../model/State";
import {getTransitions} from "./util/getTransitions";

export const LTSInfo: FC<{state: State}> = ({state}) => {
    const theme = getTheme();
    const [h] = useDataHook();

    const lts = state.getLTS(h);
    const [satisfyingStates] = useMemoDataHook(h => {
        const selected = state.getShownFormula(h);
        if (!selected) return null;
        const result = selected.getResult(h);
        if (!result) return null;
        return [...result.satisfyingStates].map(state => (
            <>
                <code
                    key={state}
                    style={{
                        marginRight: theme.spacing.s1,
                        background: theme.palette.neutralLight,
                    }}>
                    {state}
                </code>{" "}
            </>
        ));
    }, []);

    const [loading, setLoading] = useState(false);
    const selectText = useCallback<ChangeEventHandler<HTMLInputElement>>(
        async e => {
            setLoading(true);
            const file = e.target.files?.[0];
            if (!file) return;
            try {
                const text = await file.text();
                state.clearPoses();
                state.setLTS(text);
            } finally {
                setLoading(false);
            }
        },
        [state]
    );

    return (
        <div
            style={{padding: theme.spacing.m, maxWidth: "100%", boxSizing: "border-box"}}>
            {lts && (
                <div style={{width: 200}}>
                    <Stack horizontal>
                        <StackItem grow={1}>
                            {" "}
                            <Label>Initial state</Label>{" "}
                        </StackItem>
                        {lts.init + ""}
                    </Stack>
                    <Stack horizontal>
                        <StackItem grow={1}>
                            {" "}
                            <Label>State count</Label>{" "}
                        </StackItem>
                        {lts.states.size}
                    </Stack>
                    <Stack horizontal>
                        <StackItem grow={1}>
                            {" "}
                            <Label>Transition count</Label>{" "}
                        </StackItem>
                        {lts.transitionCount}
                    </Stack>
                </div>
            )}

            {satisfyingStates && (
                <div style={{marginTop: 20}}>
                    <Label>Satisfying states</Label>
                    <div style={{maxHeight: 400, overflowY: "auto"}}>
                        {satisfyingStates}
                    </div>
                </div>
            )}

            <div style={{marginTop: 20}}>
                <Label>Select file</Label>
                {loading ? (
                    <Spinner />
                ) : (
                    <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        accept="text"
                        onChange={selectText}
                    />
                )}
            </div>
        </div>
    );
};
