import React, {FC, Fragment, useCallback, useState} from "react";
import {
    Stack,
    StackItem,
    getTheme,
    Dropdown,
    PrimaryButton,
    ActionButton,
    DefaultButton,
} from "@fluentui/react";
import {State} from "../../model/State";
import {useDataHook} from "model-react";
import {FormulaControls} from "./FormulaControls";
import {Formula} from "../../model/Formula";

const theme = getTheme();
export const FormulaSidebar: FC<{state: State}> = ({state}) => {
    const [h] = useDataHook();
    const formulas = state.getFormulas(h);

    const onDelete = useCallback(
        (formula: Formula) => {
            state.removeFormula(formula);
        },
        [state]
    );

    const onSelect = useCallback(
        (formula: Formula) => {
            if (state.getShownFormula() == formula) state.setShownFormula(null);
            else state.setShownFormula(formula);
        },
        [state]
    );
    const selectedFormula = state.getShownFormula(h);

    const [justCreated, setJustCreated] = useState<Formula | null>(null);
    const create = useCallback(() => {
        setJustCreated(state.addFormula());
    }, [state]);

    const verifyAll = useCallback(() => {
        state.getFormulas().forEach(formula => formula.verify());
    }, []);

    return (
        <Stack
            style={{
                width: 400,
                height: "100%",
                background: theme.palette.white,
                paddingTop: theme.spacing.s1,
                boxShadow: "rgb(0 0 0 / 25%) 3px 0px 10px 0px",
                // Cut off the box shadow at the top
                clipPath: "polygon(0 0, 0px 10000px, 10000px 10000px, 10000px 0px)",
            }}>
            <StackItem
                style={{
                    marginBottom: theme.spacing.s1,
                    paddingLeft: theme.spacing.s1,
                    paddingRight: theme.spacing.s1,
                }}>
                <Stack horizontal gap={theme.spacing.s1}>
                    <StackItem grow={2}>
                        <PrimaryButton
                            style={{width: "100%"}}
                            text="Check all"
                            onClick={verifyAll}
                            allowDisabledFocus
                        />
                    </StackItem>
                    <StackItem grow={1}>
                        <DefaultButton
                            style={{width: "100%"}}
                            iconProps={{iconName: "Add"}}
                            text="New formula"
                            onClick={create}
                            allowDisabledFocus
                        />
                    </StackItem>
                </Stack>
            </StackItem>
            <StackItem
                shrink={1}
                style={{
                    minHeight: 0,
                    overflowY: "auto",
                    paddingBottom: 10,
                    paddingTop: 5,
                }}>
                {formulas.map((formula, i) => (
                    <FormulaControls
                        key={formulas.length - i}
                        formula={formula}
                        edit={justCreated == formula}
                        selected={selectedFormula == formula}
                        onDelete={onDelete}
                        onSelect={onSelect}
                    />
                ))}
            </StackItem>
        </Stack>
    );
};
