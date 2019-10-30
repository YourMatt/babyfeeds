/*
    Loading
    Displays the loading overlay.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";
import StateManager from "../utils/StateManager.jsx";

// export object
export default class Loading extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);
        this.previousState = StateManager.CopyState();

        StateManager.Store.subscribe(() => {
            if (StateManager.ValueChanged(this.previousState, "UI.IsLoading"))
                this.forceUpdate();
        });

    }

    // Renders the loading overlay.
    render() {
        this.previousState = StateManager.CopyState();

        let loading = "";
        if (StateManager.State().UI.IsLoading) {
            loading = (
                <div className={FormatCssClass("loading")}>
                    Loading
                </div>
            );
        }

        return loading;

    }

}
