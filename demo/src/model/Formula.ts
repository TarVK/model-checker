import {
    DataCacher,
    Field,
    IDataHook,
    IDataRetriever,
    Observer,
    ExecutionState,
} from "model-react";
import {
    formulaParser,
    IFormulaAST,
    ILTS,
    IVerifyResult,
    naiveVerify,
    emersonLeiVerify,
    getAlternationDepth,
    getDepth,
    getFreeVariables,
    getDependentAlternationDepth,
} from "model-checker";
import {formatSyntaxError} from "../util/formatyntaxError";
import {ISyntaxError} from "../_types/ISyntaxError";
import {IExtendedFormulaAST, getReducedAST} from "model-checker";
import {IVerifyAlgoritm} from "../_types/IVerifyAlgoritm";

/**
 * A class to store formula states
 */
export class Formula {
    protected name = new Field("");
    protected text = new Field("");
    protected descriptionText = new Field("");
    protected computationTime = new Field(0);

    protected algoritm = new Field<IVerifyAlgoritm>("EmersonLei");

    protected parsed = new DataCacher(hook => formulaParser.parse(this.text.get(hook)));
    protected ast = new DataCacher(hook => {
        const val = this.parsed.get(hook);
        if (val.status) return val.value;
        return null;
    });
    protected simplifiedAst = new DataCacher(hook => {
        const val = this.ast.get(hook);
        if (val) return getReducedAST(val);
        return null;
    });
    protected errors = new DataCacher(hook => {
        const val = this.parsed.get(hook);
        if (!val.status) return formatSyntaxError(val);
        return null;
    });

    protected depth = new DataCacher(hook => {
        const val = this.simplifiedAst.get(hook);
        if (val && !(val instanceof Set)) return getDepth(val);
        return null;
    });
    protected alternationDepth = new DataCacher(hook => {
        const val = this.simplifiedAst.get(hook);
        if (val && !(val instanceof Set)) return getAlternationDepth(val);
        return null;
    });
    protected dependentAlternationDepth = new DataCacher(hook => {
        const val = this.simplifiedAst.get(hook);
        if (val && !(val instanceof Set)) return getDependentAlternationDepth(val);
        return null;
    });
    protected freeVariables = new DataCacher(hook => {
        const val = this.simplifiedAst.get(hook);
        if (val && !(val instanceof Set)) return getFreeVariables(val);
        return null;
    });

    protected result = new Field<null | IVerifyResult>(null);
    protected loadingResult = new ExecutionState();

    protected LTS: IDataRetriever<ILTS | null>;
    protected LTSObserver: Observer<ILTS | null>;

    /**
     * Creates a new formula for a given LTS
     * @param LTS THe retriever for the LTS
     */
    public constructor(LTS: IDataRetriever<ILTS | null>) {
        this.LTS = LTS;

        this.LTSObserver = new Observer(hook => LTS(hook)).listen(() => {
            if (this.result.get() != null) this.result.set(null);
        });
    }

    /**
     * Disposes the listeners of this formula
     */
    public dispose() {
        this.LTSObserver.destroy();
    }

    /**
     * Updates the name of this formula
     * @param name The new name for this formula
     */
    public setName(name: string): void {
        this.name.set(name);
    }

    /**
     * Retrieves the name of this formula
     * @param hook The hook to subscribe to changes
     * @returns The name of this formula
     */
    public getName(hook?: IDataHook): string {
        return this.name.get(hook);
    }

    /**
     * Sets the description of this formula
     * @param text The new description of the formula
     */
    public setDescription(text: string): void {
        this.descriptionText.set(text);
    }

    /**
     * Retrieves the description of this formula
     * @param hook THe hoook to subscribe to changes
     * @returns The current description of the formula
     */
    public getDescription(hook?: IDataHook): string {
        return this.descriptionText.get(hook);
    }

    /**
     * Retrieves the algorithm that's used for verification
     * @param hook The hook to subscribe to changes
     * @returns The used algrotim type
     */
    public getAlgoritm(hook?: IDataHook): IVerifyAlgoritm {
        return this.algoritm.get(hook);
    }

    /**
     * Sets the algorithm to be used for verification
     * @param algorithm The algoritm to be used
     */
    public setAlgoritm(algorithm: IVerifyAlgoritm): void {
        this.algoritm.set(algorithm);
        this.result.set(null);
    }

    /**
     * Sets the actual formula itself
     * @param text The text of the formula
     */
    public setFormula(text: string): void {
        this.text.set(text);
        this.result.set(null);
    }

    /**
     * Retrieves the text representing the formula
     * @param hook The hook to subscribe to changes
     * @returns The text representing the formula
     */
    public getFormulaText(hook?: IDataHook): string {
        return this.text.get(hook);
    }

    /**
     * Retrieves the AST that represents the formula, potentially including negations
     * @param hook The hook to subscribe to changes
     * @returns The AST representing the formula, or null if the text is invalid
     */
    public getFormula(hook?: IDataHook): IExtendedFormulaAST | null {
        return this.ast.get(hook);
    }

    /**
     * Retrieves the AST that represents the formula, without negations
     * @param hook The hook to subscribe to changes
     * @returns The AST representing the formula, or null if the text is invalid
     */
    public getSimplifiedFormula(hook?: IDataHook): IFormulaAST | null {
        const ast = this.simplifiedAst.get(hook);
        if (!(ast instanceof Set)) return ast;
        return null;
    }

    /**
     * Retrieves the set of all variables that have an odd negation couunt
     * @param hook The hook to subscribe to changes
     * @returns The set of all variables with an odd negation count
     */
    public getOddNegations(hook?: IDataHook): Set<string> {
        const errors = this.simplifiedAst.get(hook);
        if (errors instanceof Set) return errors;
        return empty;
    }

    /**
     * Retrieves the set of free variables in this formule
     * @param hook The hook to subscribe to changes
     * @returns The current free variables
     */
    public getFreeVariables(hook?: IDataHook): Set<string> | null {
        return this.freeVariables.get(hook);
    }

    /**
     * Retrieves whether this formula is currently valid
     * @param hook The hook to subscribe to changes
     * @returns Whether the formula is currently valid
     */
    public isValid(hook?: IDataHook): boolean {
        return this.freeVariables.get(hook)?.size == 0;
    }

    /**
     * Retrieves the depth
     * @param hook The hook to subscribe to changes
     * @returns The fixpoint depth
     */
    public getDepth(hook?: IDataHook): number | null {
        return this.depth.get(hook);
    }

    /**
     * Retrieves the alternation depth
     * @param hook The hook to subscribe to changes
     * @returns The alternation fixpoint depth
     */
    public getAlternationDepth(hook?: IDataHook): number | null {
        return this.alternationDepth.get(hook);
    }

    /**
     * Retrieves the dependent alternation depth
     * @param hook The hook to subscribe to changes
     * @returns The alternation fixpoint depth
     */
    public getDependentAlternationDepth(hook?: IDataHook): number | null {
        return this.dependentAlternationDepth.get(hook);
    }

    /**
     * Retrieves the syntactic errors in the formula text, if there are any
     * @param hook The hook to subscribe to changes
     * @returns The syntactic errors if there are any
     */
    public getFormulaErrors(hook?: IDataHook): ISyntaxError | null {
        return this.errors.get(hook);
    }

    /**
     * Performs the formula verification and stores the result
     * @returns The result of the verification
     */
    public async verify(): Promise<IVerifyResult | undefined> {
        return this.loadingResult.add(async () => {
            const formula = this.getSimplifiedFormula();
            const lts = this.LTS();
            if (formula && lts) {
                const start = Date.now();

                const result =
                    this.algoritm.get() == "EmersonLei"
                        ? await emersonLeiVerify(lts, formula)
                        : await naiveVerify(lts, formula);
                this.result.set(result);
                this.computationTime.set(Date.now() - start);
                return result;
            } else this.result.set(null);
        });
    }

    /**
     * Retrieves the time it to to compute the states
     * @param hook The hook to subscribe to changes
     * @returns
     */
    public getVerificationTime(hook?: IDataHook): number {
        return this.computationTime.get(hook);
    }

    /**
     * Retrieves the currently stored result of verifiying this formula, verfication should be performed first
     * @param hook The hook to subscribe to changes
     * @returns The current verification result
     */
    public getResult(hook?: IDataHook): IVerifyResult | null {
        this.loadingResult.get(hook);
        return this.result.get(hook);
    }
}

const empty = new Set<string>();
