/*
    App
 */

import React, {Component} from "react";

// import components
import Age from "./Age.jsx";
import FeedRecorder from "./FeedRecorder.jsx";
import History from "./History.jsx";
import LastFeedTime from "./LastFeedTime.jsx";
import Weight from "./Weight.jsx"

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";

// import api interactions
import ApiLoad from "../api/Load.jsx";

// export object
export default class App extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);

        // intialize the application state
        this.state = {
            dateToday: "",
            dateBirth: "",
            dateExpected: "",
            feedsForToday: [],
            feedRequiredForToday: 0,
            feedTotalsPerDay: [],
            lastFeedTime: "",
            lastFeedVolume: 0,
            maxFeedVolume: 0,
            recipeId: 0,
            recipeName: "",
            weightOunces: 0,

            modal: "",

        };

        this.reloadData = this.reloadData.bind(this);
        this.displayModal = this.displayModal.bind(this);
        this.dismissModal = this.dismissModal.bind(this);

    };

    // Pre-mount logic.
    componentWillMount() {

        this.reloadData();

    }

    // Renders the full application.
    render() {

        // show loading if no service data
        let loading = "";
        if (!this.state.dateToday) {
            loading = (
                <div className={FormatCssClass("loading")}>
                    Loading
                </div>
            );
        }

        // set the date to start render of the calendar controls
        let historyStartDate = this.state.dateToday;
        if (this.state.feedTotalsPerDay.length) historyStartDate = this.state.feedTotalsPerDay[0].Date;

        // return jsx
        return (
            <div className={FormatCssClass("app")}>
                <div className={FormatCssClass("header")}>
                    <LastFeedTime
                        lastFeedTime={this.state.lastFeedTime}
                    />
                </div>
                <div className={FormatCssClass("body")}>
                    <FeedRecorder
                        feedsForToday={this.state.feedsForToday}
                        feedRequiredForToday={this.state.feedRequiredForToday}
                        lastFeedVolume={this.state.lastFeedVolume}
                        maxFeedVolume={this.state.maxFeedVolume}
                        recipeId={this.state.recipeId}
                        recipeName={this.state.recipeName}
                        fnReloadData={this.reloadData}
                        fnDisplayModal={this.displayModal}
                        fnDismissModal={this.dismissModal}
                    />
                    <History
                        dateStart={historyStartDate}
                        dateEnd={this.state.dateToday}
                        data={this.state.feedTotalsPerDay}
                    />
                </div>
                <div className={FormatCssClass("footer")}>
                    <Weight
                        weightOunces={this.state.weightOunces}
                    />
                    <Age
                        dateToday={this.state.dateToday}
                        dateBirth={this.state.dateBirth}
                        dateExpected={this.state.dateExpected}
                    />
                </div>
                {this.state.modal}
                {loading}
            </div>
        );

    }

    // Loads all data from the server.
    reloadData(callback) {

        ApiLoad(data => {
            this.setState({
                dateToday: data.dateToday,
                dateBirth: data.dateBirth,
                dateExpected: data.dateExpected,
                feedsForToday: data.feedsForToday,
                feedRequiredForToday: data.feedRequiredForToday,
                feedTotalsPerDay: data.feedTotalsPerDay,
                lastFeedTime: data.lastFeedTime,
                lastFeedVolume: data.lastFeedVolume,
                maxFeedVolume: data.maxFeedVolume,
                recipeId: data.recipeId,
                recipeName: data.recipeName,
                weightOunces: data.weightOunces
            });
            if (callback) callback();
        });

    }

    // Display a modal window.
    displayModal(data) {

        // build the modal structure
        let modalContent = (
            <div className={FormatCssClass("modal")}>
                <div
                    className={FormatCssClass("screen")}
                    onClick={(data.allowDismiss) ? this.dismissModal : () => {}}
                />
                <div className={FormatCssClass("content")}>
                    {data.content}
                </div>
            </div>
        );

        // add the modal to the state for rendering
        this.setState({modal: modalContent});

    }

    // Removes the modal window.
    dismissModal() {

        // remove the modal from state
        this.setState({modal: ""});

    }

}
