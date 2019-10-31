/*
    LastFeedTime
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";
import StateManager from "../utils/StateManager.jsx";

export default class LastFeedTime extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);
        this.previousState = {};

        StateManager.Store.subscribe(() => {
            if (StateManager.ValueChanged(this.previousState, [
                    "SelectedBaby",
                    "Babies.Baby" + StateManager.State().SelectedBaby + ".LastFeedTime"
                ]
            )) this.forceUpdate();
        });

    }

    // Renders the last feed time area.
    render() {

        return (
            <div className={FormatCssClass("last-feed")}>
                Last Fed at {StateManager.GetCurrentBabyDetails().LastFeedTime}
            </div>
        );

    }

}
