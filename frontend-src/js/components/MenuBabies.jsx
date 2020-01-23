/*
    Menu Babies
    Displays menu options for managing babies.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";

// export object
export default class MenuBabies extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);

        this.addBaby = this.addBaby.bind(this);

    }

    // Renders the menu panel.
    render() {

        let ccntent = "";

        return (
            <div className={FormatCssClass(["menu-panel-sub", "menu-babies"])}>
                <h1>Babies</h1>
                <div className={FormatCssClass("content")}>
                    <div className={FormatCssClass("data")}>
                        <button key="button-baby-add" onClick={this.addBaby}>Add New Baby</button>
                        {content}
                    </div>
                </div>
            </div>
        );

        /*
        return (
            <div className={FormatCssClass("menu-panel-sub open")}>
                <h1>Babies</h1>

                <h5>Need to be able to set:</h5>
                <ol>
                    <li>Name</li>
                    <li>Birth Date</li>
                    <li>Expected Date (if preemie)</li>
                    <li>Default Recipe</li>
                    <li>Goal Calories</li>
                </ol>

                <h5>Other</h5>
                <ol>
                    <li>Change email or password</li>
                    <li>Days left in trial or thank you for purchasing</li>
                </ol>

            </div>
        );

         */

    }

    addBaby(e) {
        e.preventDefault();

        StateManager.UpdateValue(
            "UI.EditingBaby",
            {
                RecipeId: -1,
                Name: "",
                Notes: "",
                CaloriesPerOunce: 0,
                LastUsed: "",
                Selectable: true
            }
        );

    }

}
