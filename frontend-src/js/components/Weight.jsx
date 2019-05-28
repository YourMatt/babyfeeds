/*
    Weight
    Displays a block containing the selected baby's weight. Clicking the area will switch between metric and imperial.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";
import FormatWeight from "../utils/FormatWeight.jsx";

// export object
export default class Weight extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);

        // intialize the state
        this.state = {
            showMetric: false // TODO: Pull from account settings
        };

        // bind event handlers
        this.changeWeightDisplay = this.changeWeightDisplay.bind(this);

    };

    // Renders the age block.
    render() {

        // return jsx
        return (
            <div
                onClick={this.changeWeightDisplay}
            >
                <div className={FormatCssClass("weight")}>
                    <h6>Weight</h6>
                    <span>{FormatWeight(this.props.weightOunces, this.state.showMetric)}</span>
                </div>
            </div>
        );

    }

    // Changes the display between actual and corrected age.
    changeWeightDisplay(e) {

        this.setState({
            showMetric: !this.state.showMetric
        });

    }

}
