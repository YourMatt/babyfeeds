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
import Modal from "./Modal.jsx";
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

    };

    // Pre-mount logic.
    componentWillMount() {

        this.reloadData();

    }

    // Renders the full application.
    render() {

        // return jsx
        return (
            <div className={FormatCssClass("app")}>
                <div className={FormatCssClass("header")}>
                    <LastFeedTime/>
                    <Menu/>
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
                    />
                    <History/>
                </div>
                <div className={FormatCssClass("footer")}>
                    <Weight/>
                    <Age/>
                </div>
                <Modal/>
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

}
