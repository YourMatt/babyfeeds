/*
    Age
    Displays a block containing the selected baby's age. In cases where the baby was a preemie, the age display can be
    toggled to switch between actual and corrected age.
 */

import React, {Component} from "react";

// import utilities
import FormatAge from "../utils/FormatAge.jsx";
import FormatCssClass from "../utils/FormatCssClass.jsx";

// export object
export default class Age extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);

        // intialize the state
        this.state = {
            showActualAge: true // TODO: Pull from account settings
        };

        // bind event handlers
        this.changeAgeDisplay = this.changeAgeDisplay.bind(this);

    };

    // Renders the age block.
    render() {

        let age = "";
        let label = "";

        // if showing the actual age, calculate the date from birth
        if (this.state.showActualAge) {
            age = FormatAge(this.props.dateToday, this.props.dateBirth);
            label = "Actual Age";
        }

        // if showing the corrected age, calculate the date from when expected
        else {
            age = FormatAge(this.props.dateToday, this.props.dateExpected);
            label = "Corrected Age";
        }

        // if no difference between corrected and actual, then display a generic label
        if (this.props.dateExpected === this.props.dateBirth)
            label = "Age";

        // return jsx
        return (
            <div
                onClick={this.changeAgeDisplay}
            >
                <div className={FormatCssClass("age")}>
                    <h6>{label}</h6>
                    <span>{age}</span>
                </div>
            </div>
        );

    }

    // Changes the display between actual and corrected age.
    changeAgeDisplay(e) {

        this.setState({
            showActualAge: !this.state.showActualAge
        });

    }

}
