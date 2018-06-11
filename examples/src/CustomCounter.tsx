import * as Surplus from "surplus";
import S, {DataSignal} from "s-js";
import {InputState} from "surplus-forms";

export function CustomCounter(props: { data: DataSignal<InputState<number>> }): JSX.Element {
    // This will be used to differentiate between internal and external updates.
    let lastVersion = -1;
    // Create a signal to decouple this component from props.data. We do this to help differentiate between
    // external and internal updates.
    let signal = S.data(S.sample(props.data).value);

    S.on(props.data, () => {
        // Just pass it through to signal. The S computation will resolve updates
        signal(props.data().value);
    });

    S(() => {
        let propsData = S.sample(props.data); // avoid dependency on props.data
        let curr = signal();
        let isExternalEvent = propsData.__v !== lastVersion;

        // First condition ensures we update because of internal updates to signal.
        // Second condition ensures we update because of external updates to props.data
        if (curr !== propsData.value || isExternalEvent) {
            // **Important** that we update lastVersion before props.data(). Otherwise lastVersion will always be
            // different and we get stuck in an infinite update cycles :(
            lastVersion = propsData.__v + 1;
            props.data({
                ...propsData,
                __v: lastVersion,
                value: curr,
                isTouched: isExternalEvent ? propsData.isTouched : true,
                error: (curr % 2) === 0 ? 1000 : 0, // Just making this up so we can see frequent error updates.
            });
        }
    });

    return (
        <div class="pd5" style={{ display: "inline-block", border: ".2rem solid #ddd" }}>
            <label>Count: {props.data().value}
                <button class="ml3"
                        onClick={ev => incrementCounter(ev)}
                        type="button">
                    Increment
                </button>
            </label>
        </div>);

    function incrementCounter(ev: Event) {
        // Internal changes are made only to the signal. This allows error handling to be
        // centralized in the S computation.
        signal(S.sample(signal) + 1);
    }
}