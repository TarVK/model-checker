import {
    getTheme,
    IconButton,
    Spinner,
    SpinnerSize,
    Stack,
    StackItem,
    Text,
} from "@fluentui/react";
import {Loader, useDataHook} from "model-react";
import React, {FC, Fragment, useEffect, useState} from "react";
import {failsColor, satisfiesColor} from "../../colors";
import {Formula} from "../../model/Formula";
import {formatTime} from "../../util/formatTime";
import {SidebarButton} from "../lts/graph/toolbar/SidebarButton";
import {FormulaModal} from "./FormulaModal";

const theme = getTheme();
export const FormulaControls: FC<{
    formula: Formula;
    selected: boolean;
    onSelect: (formula: Formula) => void;
    edit: boolean;
    onDelete: (formula: Formula) => void;
}> = ({formula, edit, selected, onSelect, onDelete}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [h] = useDataHook();

    useEffect(() => {
        setModalVisible(edit);
    }, [edit]);

    const verified = formula.getResult(h);
    const time = formatTime(formula.getVerificationTime(h));
    return (
        <div
            style={{
                boxShadow: theme.effects.elevation8,
                backgroundColor: verified
                    ? verified.verified
                        ? satisfiesColor
                        : failsColor
                    : "#fff",
                marginLeft: theme.spacing.s1,
                marginRight: theme.spacing.s1,
                marginBottom: theme.spacing.s1,
            }}>
            <FormulaModal
                formula={formula}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />

            <Stack
                horizontal
                verticalAlign="center"
                styles={{
                    root: {paddingLeft: theme.spacing.s1},
                }}>
                <StackItem grow={1} style={{paddingRight: theme.spacing.m}}>
                    {formula.getName(h)}
                </StackItem>
                <StackItem style={{paddingRight: theme.spacing.s1}}>
                    {verified ? (
                        <Fragment>
                            Verified in {time.value} {time.unit} using{" "}
                            {verified.fixpointIterations} iterations
                        </Fragment>
                    ) : null}
                </StackItem>
                <StackItem>
                    <Loader
                        onLoad={
                            <SidebarButton
                                icon={<Spinner size={SpinnerSize.small} />}
                                hover="Executing verification"
                                title="Executing verification"
                                selected={true}
                                onClick={() => {}}
                            />
                        }>
                        {h => {
                            const verified = formula.getResult(h);
                            return verified ? (
                                <SidebarButton
                                    icon="RedEye"
                                    hover="Show satisfying states"
                                    title="Show states"
                                    selected={selected}
                                    onClick={() => onSelect(formula)}
                                />
                            ) : formula.isValid(h) ? (
                                <SidebarButton
                                    icon="Play"
                                    hover="Check formula on LTS"
                                    title="Check"
                                    onClick={() => formula.verify()}
                                />
                            ) : null;
                        }}
                    </Loader>
                </StackItem>
                <StackItem>
                    <SidebarButton
                        icon="Edit"
                        hover="Edit formula"
                        title="Edit"
                        onClick={() => setModalVisible(true)}
                    />
                </StackItem>
                <StackItem>
                    <SidebarButton
                        icon="Cancel"
                        hover="Delete formula"
                        title="Delete"
                        onClick={() => onDelete(formula)}
                    />
                </StackItem>
            </Stack>
        </div>
    );
};
