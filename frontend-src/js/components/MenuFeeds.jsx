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
import ApiLoadRecipes from "../api/LoadRecipes.jsx";
import {ConvertCaloriesToVolume, ConvertVolumeToCalories} from "../utils/Converters.jsx";

// export object
export default class MenuFeeds extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);

        // intialize the state
        this.state = {
            feeds: [],
            recipes: [],
            condenseList: true, // shows only last [Constants.FeedHistoryDisplayDays] days if condensed
            editingFeed: {}, // will be populated when a feed is being edited
            volumeUnits: "mls" // TODO: Move to state of App
        };

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
        if (this.state.feeds.length) {
            let currentDate = moment().format("Y-MM-DD");
            let oldestDate = this.state.feeds[0].Date;

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
                if (this.state.condenseList && iteration >= Constants.FeedHistoryDisplayDays) isComplete = true;
                else if (!this.state.condenseList && checkDate.format("Y-MM-DD") === oldestDate) isComplete = true;

            }

            if (this.state.condenseList) {
                dayBlocks.push(
                    <button key="feeds-load-more" onClick={this.showMoreFeeds}>Load Older Feeds</button>
                );
            }

            content = dayBlocks;

        }
        else content = <p>No Feeds Recorded</p>;

        return (
            <div className={FormatCssClass(["menu-panel-sub", "menu-feeds"])}>
                <div className={FormatCssClass(["menu-panel-edit-form", (this.state.editingFeed.RecipeId) ? "open" : "closed"])}>
                    <FeedEditor feed={this.state.editingFeed} recipes={this.state.recipes}/>
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
        for (let i = this.state.feeds.length; i > 0; i--) {
            let feed = this.state.feeds[i-1];
            if (feed.Date !== dateString) continue;

            let time = moment(feed.Date + " " + feed.Time).format("h:mm");
            let timeUnit = moment(feed.Date + " " + feed.Time).format("a");
            let recipe = this.getRecipeById(feed.RecipeId);

            let volume = 0;
            let volumeUnits = "";
            if (recipe.caloriesPerOunce) {
                volume = ConvertCaloriesToVolume(feed.Calories, this.state.volumeUnits, recipe.caloriesPerOunce);
                volumeUnits = this.state.volumeUnits;
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

        for (let i = 0; i < this.state.recipes.length; i++) {
            if (this.state.recipes[i].recipeId === recipeId) return this.state.recipes[i];
        }

        return {
            name: "Unknown"
        }

    }

    reloadFeeds() {

        ApiLoadFeeds(feedData => {
            ApiLoadRecipes(recipeData => {
                this.setState({
                    feeds: feedData,
                    recipes: recipeData
                });
            });
        });

    }

    showMoreFeeds(e) {
        e.preventDefault();

        this.setState({
            condenseList: false
        });

    }

    editFeed(e) {
        e.preventDefault();

        let feedId = parseInt(e.currentTarget.dataset.feedId);

        this.state.feeds.forEach((feed) => {
            if (feed.FeedId === feedId) {
                this.setState({
                    editingFeed: feed
                });
                return false;
            }
        });

    }

}
