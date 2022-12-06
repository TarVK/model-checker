export type IVerifyResult = {
    verified: boolean;
    satisfyingStates: Set<number>;
    /** The number of iterations that were performed by all fixpoints together */
    fixpointIterations: number;
};
