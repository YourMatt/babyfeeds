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

    }

    // Renders the menu panel.
    render() {

        return (
            <div className={FormatCssClass("menu-panel-sub open")}>
                <h1>Babies</h1>
                <p>Babies panel.</p>
            </div>
        );

    }

}
