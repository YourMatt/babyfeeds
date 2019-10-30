/*
    Menu Weights
    Displays menu options for managing weights.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";
import StateManager from "../utils/StateManager.jsx";
import {ConvertKilogramsToPounds, ConvertPoundsToKilograms} from "../utils/Converters.jsx";

// import api interactions
import ApiLoadWeights from "../api/LoadWeights.jsx";
import ApiSaveWeight from "../api/SaveWeight.jsx";

// export object
export default class MenuWeights extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);
        this.previousState = {};

        StateManager.Store.subscribe(() => {
            if (StateManager.ValueChanged(this.previousState, [
                    "UI.IsSaving",
                    "Account.Settings.DisplayWeightAsMetric",
                    "SelectedBaby",
                    "Babies.Baby" + StateManager.State().SelectedBaby + ".Weights"
                ]
            )) this.forceUpdate();
        });

        this.submitWeight = this.submitWeight.bind(this);

    };

    // Renders the menu panel.
    render() {
        this.previousState = StateManager.CopyState();

        // TODO: set open/close trigger
        // TODO: add WeightEditor for menu

        /*
        let content = "";
        let weights = StateManager.GetCurrentBabyDetails().Weights;
        if (weights.length) {

            let lineItems = [];
            for (let i = weights.length - 1; i >= 0; i--) {

                let date = weights[i].Date;
                let weight = weights[i].Kilograms;
                let weightUnits = "Unit";

                lineItems.push(
                    <div className={FormatCssClass(["row", (i % 2) ? "even" : "odd"])}
                         key={"weight-for-day-" + weights[i].Date}>
                        <span className={FormatCssClass("cell-date")}><strong>{date}</strong></span>
                        <span className={FormatCssClass("cell-weight")}><strong>{weight}</strong></span>
                        <span className={FormatCssClass("cell-unit")}>{weightUnits}</span>
                    </div>
                );

            }

            content = lineItems;

        }
        else content = <p>No Weights Recorded</p>;

        return (
            <div className={FormatCssClass(["menu-panel-sub", "menu-weights"])}>
                <div className={FormatCssClass(["menu-panel-edit-form", (false) ? "open" : "closed"])}>

                </div>
                <h1>Weight History</h1>
                <div className={FormatCssClass("content")}>
                    <div className={FormatCssClass("data")}>
                        {content}
                    </div>
                    <div className={FormatCssClass("graph")}>[GRAPH]</div>
                </div>
            </div>
        );

         */

        /*
        return (
            <div className={FormatCssClass("menu-panel-sub open")}>
                <h1>Weights</h1>
                <p>Weights panel.</p>
            </div>
        );

         */

        let weightRecord = StateManager.GetCurrentBabyWeightRecord();
        let weight = weightRecord.Kilograms;
        let weightUnits = "";
        if (StateManager.State().Account.Settings.DisplayWeightAsMetric) {
            weight = weight.toFixed(3);
            weightUnits = "Kgs";
        }
        else {
            weight = ConvertKilogramsToPounds(weight);
            weight = weight.toFixed(1);
            weightUnits = "Lbs";
        }

        return (
            <div className={FormatCssClass(["menu-panel-sub", "menu-weights"])}>
                <h1>Weight</h1>
                <div className={FormatCssClass("content")}>
                    <div className={FormatCssClass("data")}>
                        <div className={FormatCssClass("panel-form")}>
                            <form className={FormatCssClass(["content", "menu-weight"])} onSubmit={this.submitWeight}>
                                <div className={FormatCssClass("form-fields")}>
                                    <h2>Current Weight</h2>
                                    <p>Last updated on {moment(weightRecord.Date).format("MMMM Do")}.</p>
                                    <div className={FormatCssClass("fields")}>
                                        <input id="input-weight" name="inputWeight" type="text" defaultValue={weight}/>
                                        {weightUnits}
                                    </div>
                                </div>
                                <button type="submit" className={FormatCssClass("save")} disabled={StateManager.State().UI.IsSaving}>Save</button>
                            </form>
                        </div>
                    </div>
                    <div className={FormatCssClass("graph")}>[GRAPH]</div>
                </div>
            </div>
        );

    }

    submitWeight(e) {
        e.preventDefault();

        // mark the status as saving
        StateManager.UpdateValue("UI.IsSaving", true);

        // find the new weight in kilograms
        let newWeight = parseFloat(e.target.inputWeight.value);
        if (!StateManager.State().Account.Settings.DisplayWeightAsMetric) {
            newWeight = ConvertPoundsToKilograms(newWeight);
        }
        newWeight = newWeight.toFixed(3);

        // save the weight
        ApiSaveWeight({
            weight: newWeight
        }, success => {

            // reload all weights from the server
            ApiLoadWeights(weights => {
                // TODO: Display error if didn't find weights

                // update the current baby's weight
                let babyId = StateManager.State().SelectedBaby;
                StateManager.UpdateValue(
                    "Babies.Baby" + babyId + ".Weights",
                    weights
                );

                // mark status as no longer saving
                StateManager.UpdateValue("UI.IsSaving", false);

            });

        });

    }

}
