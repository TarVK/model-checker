import {createLTS, ILSTAST, ILTS, ltsParser, stringifyLTS} from "model-checker";
import {DataCacher, Field, IDataHook} from "model-react";
import {drawGraph} from "../components/lts/graph/layout/drawGraph";
import {formatSyntaxError} from "../util/formatyntaxError";
import {IBoundingBox} from "../_types/IBoundingBox";
import {IPoint} from "../_types/IPoint";
import {ISyntaxError} from "../_types/ISyntaxError";
import {Formula} from "./Formula";

/**
 * A class to store the application state
 */
export class State {
    protected LTSText = new Field("");
    protected LTSPoses = new Field<Record<number, Field<IPoint>>>({});

    protected parsed = new DataCacher(hook => ltsParser.parse(this.LTSText.get(hook)));
    protected lts = new DataCacher(hook => {
        const val = this.parsed.get(hook);
        if (val.status) return createLTS(val.value);
        return null;
    });
    protected errors = new DataCacher(hook => {
        const val = this.parsed.get(hook);
        if (!val.status) return formatSyntaxError(val);
        return null;
    });

    protected formulas = new Field<Formula[]>([]);
    protected shownFormula = new Field<null | Formula>(null);

    // LTS text handling
    /**
     * Sets the text representing the LTS
     * @param text The text of the LTS
     */
    public setLTS(text: string): void {
        this.LTSText.set(text);
    }

    /**
     * Retrieves the text representing the LTS
     * @param hook The hook to subscribe to changes
     * @returns The current text representing the LTS
     */
    public getLTSText(hook?: IDataHook): string {
        return this.LTSText.get(hook);
    }

    /**
     * Retrieves the current LTS
     * @param hook The hook to subscribe to changes
     * @returns The current LTS
     */
    public getLTS(hook?: IDataHook): ILTS | null {
        return this.lts.get(hook);
    }

    /**
     * Retrieves the current syntax errors
     * @param hook The hook to subscribe to changes
     * @returns The current syntax errors
     */
    public getLTSErrors(hook?: IDataHook): ISyntaxError | null {
        return this.errors.get(hook);
    }

    // LTS visual handling
    /**
     * Retrieves the position of the state in space
     * @param state The state for which to get the position
     * @param hook The hook to subscribe to changes
     * @returns The position of the state
     */
    public getStatePos(state: number, hook?: IDataHook): IPoint {
        const poses = this.LTSPoses.get(hook);
        const pos = poses[state];
        return pos?.get(hook) || {x: 0, y: 0};
    }

    /**
     * Sets the position for a given state
     * @param state The state to set the position for
     * @param pos The position to be set
     */
    public setStatePos(state: number, pos: IPoint): void {
        let poses = this.LTSPoses.get();
        if (!poses[state]) {
            poses = {...poses, [state]: new Field({x: 0, y: 0})};
            this.LTSPoses.set(poses);
        }
        poses[state].set(pos);
    }

    /**
     * Clears all state poses
     */
    public clearPoses(): void {
        this.LTSPoses.set({});
    }

    /**
     * Retrieves all states in the LTS
     * @param hook The hook to subscribe to changes
     */
    public getStates(hook?: IDataHook): number[] {
        return [
            ...new Set([
                ...Object.keys(this.LTSPoses.get()).map(k => Number(k)),
                ...(this.lts.get(hook)?.states || []),
            ]),
        ];
    }

    /**
     * Adds a state at the given position
     * @param pos The position to add the state at
     * @returns The id of the state
     */
    public addState(pos: IPoint): number | null {
        const p = this.parsed.get();
        if (p.status) {
            const states = this.getStates();
            const newState = states.reduce((highest, s) => Math.max(highest, s), -1) + 1;
            this.setStatePos(newState, pos);
            const val: ILSTAST = {...p.value, stateCount: states.length + 1};
            this.setLTS(stringifyLTS(val));
            return newState;
        }
        return null;
    }

    /**
     * Removes a state with the given ID
     * @param id The ID of the state to be removed
     */
    public removeState(id: number): void {
        const p = this.parsed.get();
        if (p.status) {
            const poses = {...this.LTSPoses.get()};
            delete poses[id];
            const val: ILSTAST = {
                ...p.value,
                stateCount: Object.keys(poses).length,
                transitions: p.value.transitions.filter(
                    ({from, to, label}) => from != id && to != id
                ),
            };
            this.setLTS(stringifyLTS(val));
            this.LTSPoses.set(poses);
        }
    }

    /**
     * Adds a transition between the two given states, for the given action
     * @param from The state that the transition is from
     * @param to The state that the transition is to
     * @param action The label of the transition
     */
    public addTransition(from: number, to: number, action: string): void {
        const p = this.parsed.get();
        if (p.status) {
            const val: ILSTAST = {
                ...p.value,
                transitions: [...p.value.transitions, {from, to, label: action}],
            };
            this.setLTS(stringifyLTS(val));
        }
    }

    /**
     * Removes a transition between the two given states, for the given action
     * @param fromId The state that the transition is from
     * @param toId The state that the transition is to
     * @param action The label of the transition
     */
    public removeTransition(fromId: number, toId: number, action: string): void {
        const p = this.parsed.get();
        if (p.status) {
            const val: ILSTAST = {
                ...p.value,
                transitions: p.value.transitions.filter(
                    ({from, to, label}) => from != fromId || to != toId || label != action
                ),
            };
            this.setLTS(stringifyLTS(val));
        }
    }

    /**
     * Performs automatic node placement of the graph
     */
    public async layout(): Promise<void> {
        const lts = this.getLTS();
        if (!lts) return;
        const positions = await drawGraph(lts);
        Object.entries(positions).forEach(([key, pos]) =>
            this.setStatePos(Number(key), pos)
        );
    }

    protected boundingBox = new DataCacher<IBoundingBox>(hook => {
        const boundingBox = {
            minX: Infinity,
            maxX: -Infinity,
            minY: Infinity,
            maxY: -Infinity,
        };
        for (let pos of Object.values(this.LTSPoses.get(hook))) {
            const {x, y} = pos.get(hook);
            if (x < boundingBox.minX) boundingBox.minX = x;
            if (x > boundingBox.maxX) boundingBox.maxX = x;
            if (y < boundingBox.minY) boundingBox.minY = y;
            if (y > boundingBox.maxY) boundingBox.maxY = y;
        }
        return boundingBox;
    });
    /**
     * Retrieves the bounding box of the current drawing (for 0 sized nodes)
     * @param hook The hook to subscribe to changes
     * @returns The bounding box that contains the drawing
     */
    public getBoundingBox(hook?: IDataHook): IBoundingBox {
        return this.boundingBox.get(hook);
    }

    // Formula handling
    /**
     * Retrieves all formulas currently stored
     * @param hook The hook to subscribe to changes
     * @returns The currently stored formulas
     */
    public getFormulas(hook?: IDataHook): Formula[] {
        return this.formulas.get(hook);
    }

    /**
     * Adds a new formula to the state
     * @returns The newly added formula
     */
    public addFormula(): Formula {
        const formula = new Formula(hook => this.lts.get(hook));
        this.formulas.set([formula, ...this.formulas.get()]);
        return formula;
    }

    /**
     * Removes the given formula from the state
     * @param formula Theh formula to be removed
     */
    public removeFormula(formula: Formula): void {
        this.formulas.set(this.formulas.get().filter(f => f != formula));
        formula.dispose();
        if (this.shownFormula.get() == formula) this.setShownFormula(null);
    }

    /**
     * Sets the formula to be shown
     * @param formula The formula to be shown
     */
    public setShownFormula(formula: Formula | null): void {
        this.shownFormula.set(formula);
    }

    /**
     * Retrieves the formula to be shown
     * @param hook The hook to subscribe to changes
     * @returns The formula to be shown
     */
    public getShownFormula(hook?: IDataHook): Formula | null {
        return this.shownFormula.get(hook);
    }
}
