import {LTSGraphState} from "../../LTSGraphState";
import {IInteractionHandler} from "./IInteractionHandler";
import {IKeyboardHandler} from "./IKeyboardHandler";

export type IEditorPlaneProps = {
    state: LTSGraphState;
    onMouseDown?: IInteractionHandler;
    onMouseUp?: IInteractionHandler;
    onMouseMove?: IInteractionHandler;

    onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
    onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;

    onKeyDown?: IKeyboardHandler;
    onKeyUp?: IKeyboardHandler;

    height?: string | number;
    width?: string | number;
};
