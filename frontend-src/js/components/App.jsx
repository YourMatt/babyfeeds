/*
    App
 */

import React, {Component} from "react";

// import components
import Age from "./Age.jsx";
import FeedRecorder from "./FeedRecorder.jsx";
import History from "./History.jsx";
import LastFeedTime from "./LastFeedTime.jsx";
import Loading from "./Loading.jsx";
import Menu from "./Menu.jsx";
import SiteTitle from "./SiteTitle.jsx";
import Weight from "./Weight.jsx"

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";
import StateManager from "../utils/StateManager.jsx";

// import api interactions
import ApiLoad from "../api/Load.jsx";

// export object
export default class App extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);

        StateManager.Store.subscribe(() => {
            // TODO: Rerender for specific state changes
            // this.forceUpdate();
        });

        // intialize the application state
        this.state = {
            caloriesFeedMax: 0,
            caloriesLastFeed: 0,
            caloriesGoal: 0,
            dateToday: "",
            dateBirth: "",
            dateExpected: "",
            feedsForToday: [],
            feedTotalsPerDay: [],
            lastFeedTime: "",
            recipeId: 0,
            recipeName: "",
            recipeCaloriesPerOunce: 0,
            // weightKilograms: 0,

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
                    <Menu

                    />
                </div>
                <div className={FormatCssClass("body")}>
                    <FeedRecorder
                        feedsForToday={this.state.feedsForToday}
                        caloriesGoal={this.state.caloriesGoal}
                        caloriesFeedMax={this.state.caloriesFeedMax}
                        caloriesLastFeed={this.state.caloriesLastFeed}
                        recipeId={this.state.recipeId}
                        recipeName={this.state.recipeName}
                        recipeCaloriesPerOunce={this.state.recipeCaloriesPerOunce}
                        fnReloadData={this.reloadData}
                        fnDisplayModal={this.displayModal}
                        fnDismissModal={this.dismissModal}
                    />
                    <History/>
                </div>
                <div className={FormatCssClass("footer")}>
                    <Weight
                        weightKilograms={this.state.weightKilograms}
                    />
                    <Age
                        dateToday={this.state.dateToday}
                        dateBirth={this.state.dateBirth}
                        dateExpected={this.state.dateExpected}
                    />
                </div>
                {this.state.modal}
                <Loading/>
            </div>
        );

    }

    // Loads all data from the server.
    reloadData(callback) {

        ApiLoad(data => {

            StateManager.UpdateValue("UI.IsLoading", false);
            //StateManager.UpdateValue("Babies.Baby" + data.babyId + ".Weights");
            //StateManager.UpdateValue("Babies.Baby0.Weights", data.weights);
            StateManager.Store.dispatch({
                type: "RESET_SERVER_DATA",
                payload: data
            });

            this.setState({
                caloriesFeedMax: data.caloriesFeedMax,
                caloriesLastFeed: data.caloriesLastFeed,
                caloriesGoal: data.caloriesGoal,
                dateToday: data.dateToday,
                dateBirth: data.dateBirth,
                dateExpected: data.dateExpected,
                feedsForToday: data.feedsForToday,
                feedTotalsPerDay: data.feedTotalsPerDay,
                lastFeedTime: data.lastFeedTime,
                recipeId: data.recipeId,
                recipeName: data.recipeName,
                recipeCaloriesPerOunce: data.recipeCaloriesPerOunce,
                weightKilograms: data.weightKilograms
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
