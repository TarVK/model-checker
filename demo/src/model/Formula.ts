import {DataCacher, Field, IDataHook, IDataRetriever, Observer} from "model-react";
import {
    formulaParser,
    IFormulaAST,
    ILTS,
    IVerifyResult,
    naiveVerify,
} from "model-checker";
import {formatSyntaxError} from "../util/formatyntaxError";
import {ISyntaxError} from "../_types/ISyntaxError";
import {IExtendedFormulaAST, getReducedAST} from "model-checker";

/**
 * A class to store formula states
 */
export class Formula {
    protected name = new Field("");
    protected text = new Field("");
    protected computationTime = new Field(0);

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

    protected result = new Field<null | IVerifyResult>(null);

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
     * Gets the set of all variables that have an odd negation couunt
     * @param hook The hook to subscribe to changes
     * @returns The set of all variables with an odd negation count
     */
    public getOddNegations(hook?: IDataHook): Set<string> {
        const errors = this.simplifiedAst.get(hook);
        if (errors instanceof Set) return errors;
        return empty;
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
    public verify(): IVerifyResult | undefined {
        const formula = this.getSimplifiedFormula();
        const lts = this.LTS();
        if (formula && lts) {
            const start = Date.now();

            const result = naiveVerify(lts, formula);
            this.result.set(result);
            this.computationTime.set(Date.now() - start);
            return result;
        } else this.result.set(null);
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
        return this.result.get(hook);
    }
}

const empty = new Set<string>();
