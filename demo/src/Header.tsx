import {Stack, StackItem, getTheme, Link, CommandBarButton} from "office-ui-fabric-react";
import React, {FC} from "react";

const theme = getTheme();
export const Header: FC = ({children}) => (
    <Stack
        horizontal
        horizontalAlign="space-between"
        styles={{
            root: {
                background: theme.palette.white,
                boxShadow: theme.effects.elevation16,
                paddingLeft: theme.spacing.m,
                zIndex: 100,
                position: "relative",
            },
        }}>
        <StackItem align="center">
            <h1 style={{margin: 0}}>Model checker</h1>
        </StackItem>
        <StackItem align="center">{children}</StackItem>
        <StackItem align="center">
            <Link href="https://github.com/TarVK/model-checker">
                <CommandBarButton styles={{root: {padding: theme.spacing.l1}}}>
                    Github
                </CommandBarButton>
            </Link>
        </StackItem>
    </Stack>
);
