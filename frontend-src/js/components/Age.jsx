/*
    Age
    Displays a block containing the selected baby's age. In cases where the baby was a preemie, the age display can be
    toggled to switch between actual and corrected age.
 */

import React, {Component} from "react";

// import utilities
import FormatAge from "../utils/FormatAge.jsx";
import FormatCssClass from "../utils/FormatCssClass.jsx";
import StateManager from "../utils/StateManager.jsx";

// export object
export default class Age extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);
        this.previousState = {};

        this.unsubscribe = StateManager.Store.subscribe(() => {
            if (StateManager.ValueChanged(this.previousState, [
                    "SelectedBaby",
                    "Babies.Baby" + StateManager.State().SelectedBaby + ".BirthDate",
                    "Babies.Baby" + StateManager.State().SelectedBaby + ".ExpectedDate",
                    "Account.Settings.DisplayAgeAsAdjusted"
                ]
            )) this.forceUpdate();
        });

        // bind event handlers
        this.changeAgeDisplay = this.changeAgeDisplay.bind(this);

    }

    // Unmount actions.
    componentWillUnmount() {
        this.unsubscribe();
    }

    // Renders the age block.
    render() {

        let age = "";
        let label = "";

        // if showing the corrected age, calculate the date from when expected
        if (StateManager.State().Account.Settings.DisplayAgeAsAdjusted) {
            age = FormatAge(StateManager.State().DateToday, StateManager.GetCurrentBabyDetails().ExpectedDate);
            label = "Corrected Age";
        }

        // if showing the actual age, calculate the date from birth
        else {
            age = FormatAge(StateManager.State().DateToday, StateManager.GetCurrentBabyDetails().BirthDate);
            label = "Actual Age";
        }

        // if no difference between corrected and actual, then display a generic label
        if (StateManager.GetCurrentBabyDetails().BirthDate === StateManager.GetCurrentBabyDetails().ExpectedDate)
            label = "Age";

        // return jsx
        return (
            <div onClick={this.changeAgeDisplay}>
                <div className={FormatCssClass("age")}>
                    <h6>{label}</h6>
                    <span>{age}</span>
                </div>
            </div>
        );

    }

    // Changes the display between actual and corrected age.
    changeAgeDisplay(e) {

        StateManager.UpdateValue(
            "Account.Settings.DisplayAgeAsAdjusted",
            !StateManager.State().Account.Settings.DisplayAgeAsAdjusted
        );

    }

}
