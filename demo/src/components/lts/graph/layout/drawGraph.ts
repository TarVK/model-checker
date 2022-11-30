import ELK, {ElkNode} from "elkjs/lib/elk.bundled";
import {ILTS} from "model-checker";
import {IPoint} from "../../../../_types/IPoint";
import {getTransitions} from "../util/getTransitions";
import {radius} from "../drawing/Node";

const elk = new ELK();
const s = <T>(v: T) => v + "";

/**
 * Creates node positioning for the given LTS
 * @param lts The graph to layout
 * @returns The positions for each node
 */
export async function drawGraph(lts: ILTS): Promise<Record<number, IPoint>> {
    const graph: ElkNode = {
        id: "root",
        layoutOptions: {
            "elk.algorithm": "force",
            "elk.force.iterations": "500",
            "elk.spacing.nodeNode": "160",
            "elk.layered.priority.straightness": "100",
        },
        children: [...lts.states].map(state => ({
            id: s(state),
            width: radius,
            height: radius,
        })),
        edges: getTransitions(lts).map(({from, to, actions}) => ({
            id: `${from}-${to}`,
            labels: [
                {
                    height: 20 * actions.length,
                    /* Rough estimate */
                    width:
                        actions.reduce((max, action) => Math.max(max, action.length), 0) *
                        8,
                },
            ],
            sources: [s(from)],
            targets: [s(to)],
        })),
    };

    const layout = await elk.layout(graph);
    return Object.fromEntries(
        layout.children!.map(({id, x, y}) => [Number(id), {x: x!, y: y!}])
    );
}
