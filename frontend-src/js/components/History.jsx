/*
    History
 */

import React, {Component} from "react";

// import components
import CalendarMonth from "./CalendarMonth.jsx";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";
import StateManager from "../utils/StateManager.jsx";

// export object
export default class History extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);
        this.previousState = {};

        StateManager.Store.subscribe(() => {
            if (StateManager.ValueChanged(this.previousState, [
                    "SelectedBaby",
                    "Babies.Baby" + StateManager.State().SelectedBaby + ".DailyTotals"
                ]
            )) this.forceUpdate();
        });

    };

    // Renders the history area.
    render() {

        // find date span
        let dateEnd = StateManager.State().DateToday;
        let dateStart = StateManager.State().DateToday;
        if (StateManager.GetCurrentBabyDetails().DailyTotals.length)
            dateStart = StateManager.GetCurrentBabyDetails().DailyTotals[0].Date;

        // build calendar controls
        let calendars = [];
        let checkMonthObj = moment(dateStart);
        let checkMonth = parseInt(checkMonthObj.format("YMM"));
        let endMonth = parseInt(moment(dateEnd).format("YMM"));
        while (checkMonth <= endMonth) {

            calendars.push(
                <CalendarMonth
                    key={checkMonth}
                    month={checkMonthObj.format("Y-MM")}
                    data={StateManager.GetCurrentBabyDetails().DailyTotals}
                />
            );

            checkMonthObj.add(1, "months");
            checkMonth = parseInt(checkMonthObj.format("YMM"));
        }

        // return jsx
        return (
            <div className={FormatCssClass("history")}>
                <div className={FormatCssClass(["scroll", "calendars-" + calendars.length])}>
                    {calendars}
                </div>
            </div>
        );

    }

    // Scroll to end whenever data are updated.
    componentDidUpdate() {

        // Scrolls the history area to display the latest months. Works the same for both portrait and landscape
        // orientations.
        let scrollHistoryToLatest = () => {
            document.querySelector(".history").scrollLeft = document.querySelector(".history .scroll").clientWidth;
            document.querySelector(".history").scrollTop = document.querySelector(".history .scroll").clientHeight;
        };
        scrollHistoryToLatest();

        // set to reset the scroll when resizing
        if (!window.onresize) {
            window.onresize = scrollHistoryToLatest;
        }

    }

}
