/*
    Menu Weights
    Displays menu options for managing weights.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";

// export object
export default class MenuWeights extends Component {

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
                <h1>Weights</h1>
                <p>Weights panel.</p>
            </div>
        );

    }

}
