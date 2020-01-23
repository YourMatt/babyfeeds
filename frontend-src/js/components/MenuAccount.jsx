/*
    Menu Account
    Displays menu options for managing the user account.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";

// export object
export default class MenuAccount extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);

    }

    // Renders the menu panel.
    render() {

        return (
            <div className={FormatCssClass("menu-panel-sub open")}>
                <h1>Account</h1>

                <h5>Need to be able to set:</h5>
                <ol>
                    <li>Name</li>
                    <li>Email</li>
                    <li>Setting: Metric Feed Volumes</li>
                    <li>Setting: Metric Weight</li>
                </ol>

                <h5>Other</h5>
                <ol>
                    <li>Change email or password</li>
                    <li>Days left in trial or thank you for purchasing</li>
                </ol>

            </div>
        );

    }

}
