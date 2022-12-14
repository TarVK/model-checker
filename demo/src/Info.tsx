import {Link} from "@fluentui/react";
import React, {FC} from "react";
import {InlineTex} from "react-tex";
import {Literal} from "./components/Literal";

export const Info: FC = () => (
    <>
        <p>
            This website provides simple Labeled Transition System (LTS) model checking
            capabilities created for the Algorithms for Model Checking course (2IMF35)
            taught at{" "}
            <Link href="https://www.tue.nl/en/">Eindhoven University of Technology</Link>.
        </p>
        <p>
            The course required us to implement a simple fixpoint formula checker for a
            given LTS. I additionally designed this website around the base functionality,
            using some of my previous projects as a template. On this site you can edit a
            LTS in text (
            <Link href="https://www.mcrl2.org/web/user_manual/language_reference/lts.html#aldebaran-format">
                aldebran format
            </Link>
            ) or visual form, and create multiple formulas. These formulas are based on{" "}
            <Link href="https://en.wikipedia.org/wiki/Modal_%CE%BC-calculus">
                modal mu-calculus
            </Link>{" "}
            and are constructed with the following grammar: <br />
            <InlineTex
                texContent={`$$f,g ::= false \\mid true \\mid X \\mid\\; !f \\mid f \\&\\& g \\mid f || g \\mid f\\text{=>}g \\mid [a]f \\mid \\text{<}a\\text{>} f \\mid mu \\; X.f \\mid nu \\; X.f \\mid (f)$$
                `}
            />{" "}
            <br />
            <Literal>X</Literal> can be replaced by any valid variable name, and{" "}
            <Literal>a</Literal> can be replaced by any transition in the LTS. The formula
            constructions have the following interpretation for a given state{" "}
            <Literal>s</Literal>:
            <ul>
                <li>
                    <Literal>false</Literal>: does not hold for <Literal>s</Literal>
                </li>
                <li>
                    <Literal>true</Literal>: holds for <Literal>s</Literal>
                </li>
                <li>
                    <Literal>X</Literal>: holds for <Literal>s</Literal> if the fixpoint
                    that declared this variable holds for <Literal>s</Literal>
                </li>
                <li>
                    <Literal>!f</Literal>: holds for <Literal>s</Literal> if{" "}
                    <Literal>f</Literal> does not hold for <Literal>s</Literal>
                </li>
                <li>
                    <Literal>{`f&&g`}</Literal>: holds for <Literal>s</Literal> if{" "}
                    <Literal>f</Literal> holds for <Literal>s</Literal> and{" "}
                    <Literal>g</Literal> holds for <Literal>s</Literal>
                </li>
                <li>
                    <Literal> {`f||g`}</Literal>: holds for <Literal>s</Literal> if{" "}
                    <Literal>f</Literal> holds for <Literal>s</Literal> or{" "}
                    <Literal>g</Literal> holds for <Literal>s</Literal>
                </li>
                <li>
                    <Literal> {`f=>g`}</Literal>: holds for <Literal>s</Literal> if when{" "}
                    <Literal>f</Literal> holds for <Literal>s</Literal> or{" "}
                    <Literal>g</Literal> also holds for <Literal>s</Literal>
                </li>
                <li>
                    <Literal> {`[a]f`}</Literal>: holds for <Literal>s</Literal> if{" "}
                    <Literal>f</Literal> holds for all states <Literal>q</Literal> that
                    are reachable from <Literal>s</Literal> using a single{" "}
                    <Literal>a</Literal> transition
                </li>
                <li>
                    <Literal> {`<a>f`}</Literal>: holds for <Literal>s</Literal> if{" "}
                    <Literal>f</Literal> holds for some state <Literal>q</Literal> that's
                    reachable from <Literal>s</Literal> using a single{" "}
                    <Literal>a</Literal> transition
                </li>
                <li>
                    <Literal> {`mu X.f`}</Literal>: holds for <Literal>s</Literal> if{" "}
                    <Literal>f</Literal> holds for <Literal>s</Literal>, where{" "}
                    <Literal>X</Literal> may occur in <Literal>f</Literal>, but "recurses"
                    only finitely often
                </li>
                <li>
                    <Literal> {`nu X.f`}</Literal>: holds for <Literal>s</Literal> if{" "}
                    <Literal>f</Literal> holds for <Literal>s</Literal>, where{" "}
                    <Literal>X</Literal> may occur in <Literal>f</Literal>, and may
                    "recurse" infinitely often
                </li>
            </ul>
            A formula holds for a LTS, if it holds for the initial state of the LTS
            (usually state 0). Note that instead of specifying a single action, a regular
            expression may also be specified in accordance with{" "}
            <a href="https://www.mcrl2.org/web/user_manual/articles/basic_modelling.html?highlight=formula#regular-hml">
                regular HML syntax
            </a>
            . Many constructs - like these regular HML paths, negation, and implications -
            are transformed out of the formula that the model checker eventually operates
            on. They only serve as syntactic sugar to more easily write formulas. The
            final formula that's verified by the model checker can be found in the "stats"
            tab of the formula editor.
        </p>
        <p>
            The fixpoints (<Literal>mu</Literal> and <Literal>nu</Literal>) sound rather
            confusing, but behave similar to a recursive function. Consider the formula{" "}
            <Literal>{"nu X. <a>X"}</Literal>. This formula holds for a state{" "}
            <Literal>s</Literal> if there is a successor state <Literal>q</Literal> for
            which the same formula holds, that is reachable by an <Literal>a</Literal>{" "}
            transition from <Literal>s</Literal>. This formula always recurses, hence it
            can only hold for an infinite path. Since our LTS is finite, this means it
            detects <Literal>a</Literal> paths to <Literal>a</Literal> cycles. Meanwhile{" "}
            <Literal>{"mu X. <a>X"}</Literal> won't ever hold because the formula can only
            ever hold for an infinite path, and <Literal>mu</Literal> only allows finite
            recursion.
        </p>
        <p>
            The code for the model-checker itself and this website (under demo) is visible
            on{" "}
            <Link href="https://github.com/TarVK/model-checker">
                Github.com/TarVK/model-checker
            </Link>
            .
        </p>
        <p>
            This website was created using several libraries including{" "}
            <Link href="https://reactjs.org/">React</Link>,{" "}
            <Link href="https://microsoft.github.io/monaco-editor/">Monaco</Link>, and{" "}
            <Link href="https://developer.microsoft.com/en-us/fluentui#/">Fluent-UI</Link>
            .
        </p>
    </>
);
