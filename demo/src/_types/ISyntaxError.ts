import {Index} from "model-checker";

export type ISyntaxError = {expected: string[]; index: Index; message: string};
