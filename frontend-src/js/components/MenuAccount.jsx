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

        // intialize the state
        this.state = {};

    };

    // Renders the menu panel.
    render() {

        return (
            <div className={FormatCssClass("menu-panel-sub open")}>
                <h1>Account</h1>
                <p>Account panel.</p>
            </div>
        );

    }

}
