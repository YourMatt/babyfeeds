/*
    Menu Feeds
    Displays menu options for managing feeds.
 */

import React, {Component} from "react";

// import components
import FeedEditor from "./FeedEditor.jsx";

// import utilities
import * as Constants from "../utils/Constants.jsx";
import FormatCssClass from "../utils/FormatCssClass.jsx";
import ApiLoadFeeds from "../api/LoadFeeds.jsx";
import {ConvertCaloriesToVolume, ConvertVolumeToCalories} from "../utils/Converters.jsx";
import StateManager from "../utils/StateManager.jsx";

// export object
export default class MenuFeeds extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);
        this.previousState = {};

        StateManager.Store.subscribe(() => {
            if (StateManager.ValueChanged(this.previousState, [
                    "SelectedBaby",
                    "Babies.Baby" + StateManager.State().SelectedBaby + ".Feeds", // need to apply for all baby IDs
                    "UI.EditingFeed"
                ]
            )) this.forceUpdate();
        });

        this.showMoreFeeds = this.showMoreFeeds.bind(this);
        this.editFeed = this.editFeed.bind(this);

    };

    // Pre-mount logic.
    componentWillMount() {

        this.reloadFeeds();

    }

    // Renders the menu panel.
    render() {

        let content = "";
        if (StateManager.GetCurrentBabyDetails().Feeds.length) {
            let oldestDate = StateManager.State().DateToday;
            if (StateManager.GetCurrentBabyDetails().DailyTotals.length)
                oldestDate = StateManager.GetCurrentBabyDetails().DailyTotals[0].Date;

            let dayBlocks = [];
            let isComplete = false;
            let iteration = 0;
            while (!isComplete) {

                let checkDate = moment().add(-iteration, "days");

                let dateLabel = "";
                if (!iteration) dateLabel = "Today";
                else if (iteration === 1) dateLabel = "Yesterday";
                else dateLabel = checkDate.format("MMMM Do");

                let feedBlocks = this.renderFeedBlocks(checkDate.format("Y-MM-DD"));

                dayBlocks.push(
                    <div className={FormatCssClass("feeds-day-block")} key={"feeds-for-day-" + checkDate}>
                        <div className={FormatCssClass("feeds-day-block-contents")}>
                        <h2>
                            {dateLabel}
                            <button className={FormatCssClass("btn-add")}>+</button>
                        </h2>
                        {feedBlocks}
                        </div>
                    </div>
                );

                iteration++;
                if (StateManager.State().UI.ResultsCondensed && iteration >= Constants.FeedHistoryDisplayDays) isComplete = true;
                else if (!StateManager.State().UI.ResultsCondensed && checkDate.format("Y-MM-DD") === oldestDate) isComplete = true;

            }

            if (StateManager.State().UI.ResultsCondensed) {
                dayBlocks.push(
                    <button key="feeds-load-more" onClick={this.showMoreFeeds}>Load Older Feeds</button>
                );
            }

            content = dayBlocks;

        }
        else content = <p>No Feeds Recorded</p>;

        return (
            <div className={FormatCssClass(["menu-panel-sub", "menu-feeds"])}>
                <div className={FormatCssClass(["menu-panel-edit-form", (StateManager.State().UI.EditingFeed.FeedId !== 0) ? "open" : "closed"])}>
                    <FeedEditor/>
                </div>
                <h1>Feeds</h1>
                <div className={FormatCssClass("content")}>
                    <div className={FormatCssClass("data")}>
                        {content}
                    </div>
                    <div className={FormatCssClass("graph")}>[GRAPH]</div>
                </div>
            </div>
        );

    }

    renderFeedBlocks(dateString) {

        let feedBlocks = [];
        for (let i = StateManager.GetCurrentBabyDetails().Feeds.length; i > 0; i--) {
            let feed = StateManager.GetCurrentBabyDetails().Feeds[i-1];
            if (feed.Date !== dateString) continue;

            let time = moment(feed.Date + " " + feed.Time).format("h:mm");
            let timeUnit = moment(feed.Date + " " + feed.Time).format("a");
            let recipe = this.getRecipeById(feed.RecipeId);

            let volume = 0;
            let volumeUnits = "";
            if (recipe.CaloriesPerOunce) {
                volumeUnits = (StateManager.State().Account.Settings.DisplayVolumeAsMetric) ? "mls" : "ozs";
                volume = ConvertCaloriesToVolume(feed.Calories, volumeUnits, recipe.CaloriesPerOunce);
            }
            else {
                volume = feed.Calories;
                volumeUnits = "cals";
            }

            feedBlocks.push(
                <div className={FormatCssClass(["row", (feedBlocks.length % 2) ? "even" : "odd"])}
                     onClick={this.editFeed}
                     data-feed-id={feed.FeedId}
                     key={"feeds-for-day-" + dateString + "-" + i}>
                    <span className={FormatCssClass("cell-time")}><strong>{time}</strong>{timeUnit}</span>
                    <span className={FormatCssClass("cell-volume")}><strong>{volume}</strong></span>
                    <span className={FormatCssClass("cell-unit")}>{volumeUnits}</span>
                    <button className={FormatCssClass("btn-edit")}>^</button>
                </div>
            );

        }

        return feedBlocks;

    }

    getRecipeById(recipeId) {

        const recipes = StateManager.State().Account.Recipes;
        for (let i = 0; i < recipes.length; i++) {
            if (recipes[i].RecipeId === recipeId) return recipes[i];
        }

        return {
            Name: "Unknown"
        }

    }

    reloadFeeds() {

        ApiLoadFeeds(feedData => {
            StateManager.UpdateValue("Babies.Baby" + StateManager.State().SelectedBaby + ".Feeds", feedData);
        });

    }

    showMoreFeeds(e) {
        e.preventDefault();

        StateManager.UpdateValue("UI.ResultsCondensed", false);

    }

    editFeed(e) {
        e.preventDefault();

        let feedId = parseInt(e.currentTarget.dataset.feedId);

        let feeds = StateManager.GetCurrentBabyDetails().Feeds;
        feeds.forEach((feed) => {
            if (feed.FeedId === feedId) {
                StateManager.UpdateValue("UI.EditingFeed", feed);
                return false;
            }
        });

    }

}
