/*
    SiteTitle
    Displays the site title area which changes with the baby name and acts as a control to switch between babies.
 */

import React, {Component} from "react";

// export object
export default class SiteTitle extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);

        // bind event handlers
        this.changeBaby = this.changeBaby.bind(this);

    }

    // Renders the age block.
    render() {

        // return jsx
        return (
            <div
                onClick={this.changeBaby}
            >
                Cooper Eats
            </div>
        );

    }

    // Changes the selected baby.
    changeBaby(e) {

    }

}
