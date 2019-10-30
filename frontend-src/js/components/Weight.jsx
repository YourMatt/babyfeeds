/*
    Weight
    Displays a block containing the selected baby's weight. Clicking the area will switch between metric and imperial.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";
import FormatWeight from "../utils/FormatWeight.jsx";
import StateManager from "../utils/StateManager.jsx";

// export object
export default class Weight extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);
        this.previousState = {};

        StateManager.Store.subscribe(() => {
            console.log("Hit weight render.");
            if (StateManager.ValueChanged(this.previousState, [
                "Account.Settings.DisplayWeightAsMetric",
                "SelectedBaby",
                "Babies.Baby" + StateManager.State().SelectedBaby + ".Weights"
                ]
            )) this.forceUpdate();
        });

        // bind event handlers
        this.changeWeightDisplay = this.changeWeightDisplay.bind(this);

    };

    // Renders the age block.
    render() {
        this.previousState = StateManager.CopyState();

        // return jsx
        return (
            <div onClick={this.changeWeightDisplay}>
                <div className={FormatCssClass("weight")}>
                    <h6>Weight</h6>
                    <span>{FormatWeight(StateManager.GetCurrentBabyWeight(), StateManager.State().Account.Settings.DisplayWeightAsMetric)}</span>
                </div>
            </div>
        );

    }

    // Changes the display between actual and corrected age.
    changeWeightDisplay(e) {

        StateManager.UpdateValue(
            "Account.Settings.DisplayWeightAsMetric",
            !StateManager.State().Account.Settings.DisplayWeightAsMetric
        );

    }

}
