export type ILSTAST = {
    firstState: number;
    stateCount: number;
    transitionCount: number;
    transitions: {
        from: number;
        label: string;
        to: number;
    }[];
};
