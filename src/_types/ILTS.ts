export type ILTS = {
    init: number;
    states: Set<number>;
    transitions: Map<string, Map<number, Set<number>>>; // Transition -> FromState -> ToState[]
};
