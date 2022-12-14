import {
    Dropdown,
    getTheme,
    Label,
    Stack,
    StackItem,
    TextField,
    Toggle,
} from "office-ui-fabric-react";
import React, {FC, MutableRefObject, useCallback, useState} from "react";
import {InlineTex, Tex} from "react-tex";
import {Literal} from "../../components/Literal";
import {genList} from "../../util/genList";
import {IModelData} from "../../_types/IModelData";
import {getRemoteLTS} from "../getRemoteLts";
import {br} from "../latex";

const theme = getTheme();
export const diningPhilosophers = {
    name: "Dining Philosophers",
    Comp: ({getCode}: {getCode: MutableRefObject<() => Promise<IModelData>>}) => {
        const [count, setCount] = useState(2);

        getCode.current = useCallback(
            async () => ({
                modelText: await getRemoteLTS(`diningPhilosophers/dining_${count}.aut`),
                formulas: [
                    {
                        name: "Invariantly inevitably eat",
                        description:
                            "In every reachable state, someone must start eating",
                        formula:
                            "nu X. (([i]X && ([plato]X && [others]X )) && mu Y. ([i]Y && (<plato>true || <others>true)) )",
                    },
                    {
                        name: "Invariantly Plato starves",
                        description:
                            "In every state, reachable by plato not eating, plato has the chance to starve",
                        formula:
                            "nu X. (([i]X && [others]X ) && nu Y. (<i>Y || <others>Y) )",
                    },
                    {
                        name: "Invariantly possibly eat",
                        description: "Invariantly, plato can eat in some future",
                        formula: `nu X. (
    ([i]X && ([plato]X && [others]X )) 
    && mu Y. ((<i>Y || <others>Y) || <plato>true )
)`,
                    },
                    {
                        name: "Plato infinitely often can eat",
                        description:
                            "There is a course of events in which Plato infinitely often eats",
                        formula: "nu X. mu Y. ( (<plato>X || <i>Y) || <others>Y)", // nu X. <(!plato)*.plato>X
                    },
                ],
                simplified: count >= 4,
            }),
            [count]
        );

        return (
            <>
                <p>
                    <a href="https://en.wikipedia.org/wiki/Dining_philosophers_problem">
                        The dining philosophers problem
                    </a>{" "}
                    <img
                        style={{float: "right"}}
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/An_illustration_of_the_dining_philosophers_problem.png/220px-An_illustration_of_the_dining_philosophers_problem.png"
                    />
                    is an example problem about concurrent behavior and synchronization.
                    In this problem, a number of philosophers (including Plato) sit around
                    a round table. Each philosopher has their own plate, and there is a
                    single eating utensil between every pair of plates. Each philosopher
                    wants to alternate between eating an philosophizing. In order to eat,
                    a philosopher needs the utensils from both sides of their plate. A
                    philosopher can only pick up and put down one utensil at a time, and
                    wont put down their utensil until they've eaten.
                </p>
                <p>
                    Now one can ask several questions about this scenario, including
                    whether it's possible that the philosophers get stuck in a state where
                    nobody is able to eat.
                </p>
                <p>
                    We can model this behavior using a Labeled Transition System where we
                    abstract away transitions we don't care about, by labeling them with{" "}
                    <Literal>i</Literal>. We only identify the <Literal>plato</Literal>{" "}
                    and <Literal>others</Literal> transitions representing either Plato or
                    another philosopher eating.
                </p>

                <p style={{clear: "both"}}>
                    Note that this problem scales exponentially, so the 11 philosopher
                    model is very large and will not run well at all!
                    <Dropdown
                        placeholder="Select philosopher count"
                        label="Philosopher count"
                        options={new Array(10).fill(null).map((_, i) => ({
                            key: i + 2,
                            text: i + 2 + "",
                            data: i + 2,
                            selected: count == i + 2,
                        }))}
                        onChange={(e, option) => {
                            option && setCount(option.data);
                        }}
                    />
                </p>
            </>
        );
    },
};
