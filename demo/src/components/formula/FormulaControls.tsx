import {getTheme, IconButton, Stack, StackItem, Text} from "@fluentui/react";
import {useDataHook} from "model-react";
import React, {FC, Fragment, useEffect, useState} from "react";
import {Formula} from "../../model/Formula";
import {formatTime} from "../../util/formatTime";
import {FormulaModal} from "./FormulaModal";

const theme = getTheme();
export const FormulaControls: FC<{
    formula: Formula;
    edit: boolean;
    onDelete: (formula: Formula) => void;
}> = ({formula, edit, onDelete}) => {
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
                        ? "#96ff9c"
                        : "#ff9f96"
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
                styles={{
                    root: {lineHeight: 32, paddingLeft: theme.spacing.s1},
                }}>
                <StackItem grow={1}>{formula.getName(h)}</StackItem>
                <StackItem>
                    {verified ? (
                        <Fragment>
                            Verified in {time.value} {time.unit}
                        </Fragment>
                    ) : (
                        <IconButton
                            iconProps={{iconName: "Play"}}
                            aria-label="Emoji"
                            onClick={() => formula.verify()}
                        />
                    )}
                </StackItem>
                <StackItem>
                    <IconButton
                        iconProps={{iconName: "Edit"}}
                        aria-label="Emoji"
                        onClick={() => setModalVisible(true)}
                    />
                </StackItem>
                <StackItem>
                    <IconButton
                        iconProps={{iconName: "Cancel"}}
                        aria-label="Emoji"
                        onClick={() => onDelete(formula)}
                    />
                </StackItem>
            </Stack>
        </div>
    );
};
