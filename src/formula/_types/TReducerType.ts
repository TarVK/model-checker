export type TReducerType<T extends {type: string}, O> = {
    [K in T["type"]]: {k: T} extends {k: infer S}
        ? S extends {type: K}
            ? (arg: {[K in keyof S]: S[K] extends T ? O : S[K]}) => O
            : never
        : never;
};
