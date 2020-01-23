/*
    FeedRecorder
 */

import React, {Component} from "react";

// import utilities
import {ConvertCaloriesToVolume, ConvertVolumeToCalories} from "../utils/Converters.jsx";
import FormatCssClass from "../utils/FormatCssClass.jsx";
import FormatFeedVolume from "../utils/FormatFeedVolume.jsx";
import StateManager from "../utils/StateManager.jsx";

// import api interactions
import ApiLoadRecipes from "../api/LoadRecipes.jsx";
import ApiSaveFeed from "../api/SaveFeed.jsx";

export default class FeedRecorder extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);
        this.previousState = {};

        // reload the data after regaining focus
        let self = this;
        document.addEventListener("visibilitychange", function() {
            let state = document.visibilityState || document.webkitVisibilityState;
            if (state === "visible") {
                StateManager.ReloadFromServer();
            }
        });

        this.unsubscribe = StateManager.Store.subscribe(() => {
            if (StateManager.ValueChanged(this.previousState, [
                    "Account.Settings.DisplayVolumeAsMetric",
                    "SelectedBaby",
                    "Babies.Baby" + StateManager.State().SelectedBaby + ".RecipeId",
                    "Babies.Baby" + StateManager.State().SelectedBaby + ".FeedsForToday",
                    "Babies.Baby" + StateManager.State().SelectedBaby + ".Goals",
                    "Babies.Baby" + StateManager.State().SelectedBaby + ".Weights",
                    "UI.IsSaving",
                    "UI.FeedRecorder"
                ]
            )) this.forceUpdate();
        });

        this.updateVolume = this.updateVolume.bind(this);
        this.showVolumeWidget = this.showVolumeWidget.bind(this);
        this.hideVolumeWidget = this.hideVolumeWidget.bind(this);
        this.displayHourSelection = this.displayHourSelection.bind(this);
        this.displayMinuteSelection = this.displayMinuteSelection.bind(this);
        this.displayRecipeSelection = this.displayRecipeSelection.bind(this);
        this.changeHourSelection = this.changeHourSelection.bind(this);
        this.changeMinuteSelection = this.changeMinuteSelection.bind(this);
        this.changeAmPmSelection = this.changeAmPmSelection.bind(this);
        this.changeRecipeSelection = this.changeRecipeSelection.bind(this);
        this.addRecipe = this.addRecipe.bind(this);
        this.submitFeed = this.submitFeed.bind(this);

    }

    // Unmount actions.
    componentWillUnmount() {
        this.unsubscribe();
    }

    // Renders the feed recorder.
    render() {

        // find the total volume for the day
        let totalCalories = 0;
        StateManager.GetCurrentBabyDetails().FeedsForToday.forEach((value) => {
            totalCalories += value.Calories;
        });
        let totalCaloriesGoal = Math.round(StateManager.GetCurrentBabyGoalCaloriesPerKilogram() * StateManager.GetCurrentBabyWeight());

        let selectedRecipe = StateManager.GetRecipeRecord(StateManager.GetFeedRecorderData().SelectedRecipeId);

        // convert volume to the current unit
        let remainingVolumeData = FormatFeedVolume(
            StateManager.GetFeedRecorderData().SelectedVolumeUnit,
            (totalCalories < totalCaloriesGoal) ? (totalCaloriesGoal - totalCalories) : 0,
            StateManager.GetCurrentBabyDetails().MaxFeedCalories,
            selectedRecipe.CaloriesPerOunce
        );

        let sliderVolumeData = {
            ...remainingVolumeData,
            volume: StateManager.GetFeedRecorderData().SelectedVolume,
        };

        // adjust the volume to match a number by the increment step
        let selectedVolume = 0;
        if (StateManager.GetFeedRecorderData().SelectedVolume) {
            selectedVolume = Math.round((StateManager.GetFeedRecorderData().SelectedVolume - sliderVolumeData.sliderIncrement) / sliderVolumeData.sliderIncrement) * sliderVolumeData.sliderIncrement + sliderVolumeData.sliderIncrement;
        }

        // return jsx
        return (
            <div className={FormatCssClass("feed-recorder")}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 100 100"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <clipPath id="bottle-clip-path">
                            <path d="M93.25,37H87.6V28.52c0-1.77-2.15-3.21-4.82-3.21H81.47c-4-3.66-10.67-6.54-18.87-8h0c-1.37-1.07-2.15-3.2-2.09-5.74h0a5.38,5.38,0,0,0,.9-2.94C61.4,4.4,56.29,1,50,1S38.6,4.4,38.6,8.6a5.4,5.4,0,0,0,.87,2.89v0c.08,2.56-.73,4.71-2.11,5.79h0c-8.17,1.48-14.88,4.36-18.82,8H17.22c-2.67,0-4.82,1.44-4.82,3.21V37H6.75C3.58,37,1,38.76,1,40.88V95.16C1,97.28,3.58,99,6.75,99h86.5C96.42,99,99,97.28,99,95.16V40.88C99,38.76,96.42,37,93.25,37Z"/>
                        </clipPath>
                        <linearGradient id="bottle-background" x1="20%" y1="0%" x2="80%" y2="100%">
                            <stop offset="0%" stopColor="#FFF" />
                            <stop offset="100%" stopColor="#CCC" />
                        </linearGradient>
                        <linearGradient id="bottle-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFF8C9" />
                            <stop offset="100%" stopColor="#F7E888" />
                        </linearGradient>
                    </defs>
                    <g className="bottle-clipped">
                        <rect className={FormatCssClass("bottle-background")} x="0" y="0" width="100%" height="100%"/>
                        <g id="bottle-fills">
                            {this.buildSvgFeedVolumeBlocks(totalCaloriesGoal, StateManager.GetCurrentBabyDetails().FeedsForToday)}
                        </g>
                    </g>
                </svg>
                <div className={FormatCssClass("areas")}>
                    <div className={FormatCssClass("remaining")}>
                        <h2>{remainingVolumeData.volume}<small>{remainingVolumeData.unitLabel}</small></h2>
                        <h3>Remaining</h3>
                    </div>
                    <form
                        className={FormatCssClass("input")}
                        onSubmit={this.submitFeed}
                    >
                        <div className={FormatCssClass("recipe")}>
                            <button onClick={this.displayRecipeSelection}>{selectedRecipe.Name}</button>
                        </div>
                        <div className={FormatCssClass("time")}>
                            <button onClick={this.displayHourSelection}>{StateManager.GetFeedRecorderData().SelectedHour}</button>
                            :
                            <button onClick={this.displayMinuteSelection}>{StateManager.GetFeedRecorderData().SelectedMinute.toString().padStart(2, "0")}</button>
                            <button className={FormatCssClass("small")} onClick={this.changeAmPmSelection}>{StateManager.GetFeedRecorderData().SelectedAmPm}</button>
                        </div>
                        <div className={FormatCssClass("volume-control")}>
                            <div className={FormatCssClass("volume")}>
                                {selectedVolume}<small>{sliderVolumeData.unitLabel}</small>
                            </div>
                            <div className={FormatCssClass("slider")}>
                                <input
                                    type="range"
                                    min={sliderVolumeData.sliderMin}
                                    max={sliderVolumeData.sliderMax}
                                    value={selectedVolume}
                                    step={sliderVolumeData.sliderIncrement}
                                    onChange={this.updateVolume}
                                    onMouseDown={this.showVolumeWidget}
                                    onMouseUp={this.hideVolumeWidget}
                                    onTouchStart={this.showVolumeWidget}
                                    onTouchEnd={this.hideVolumeWidget}
                                />
                            </div>
                        </div>
                        <div className={FormatCssClass("button")}>
                            <button type="submit" disabled={StateManager.State().UI.IsSaving}>Save</button>
                        </div>
                    </form>
                </div>
            </div>
        );

    }

    // Creates the SVG blocks that represent each feed for the date.
    buildSvgFeedVolumeBlocks(totalFeedsRequired, feedsForToday) {

        let currentPercent = 100;
        let feedBlocks = [];
        feedsForToday.forEach(value => {
            if (!value.Time) return;

            let feedPercent = 100 * value.Calories / totalFeedsRequired;
            currentPercent -= feedPercent;

            feedBlocks.push(
                <rect
                    key={value.Time}
                    className="bottle-fill"
                    y={currentPercent}
                    width="100"
                    height={feedPercent}
                />
            );
            feedBlocks.push(
                <rect
                    key={"TopBorder" + value.Time}
                    className={FormatCssClass("bottle-fill-topline")}
                    y={currentPercent - 0.5}
                    width="100"
                    height="1"
                />
            );

        });

        return feedBlocks;

    }

    // Display a modal allowing selection of an hour.
    displayHourSelection(e) {
        e.preventDefault();

        let options = [];
        for (let i = 1; i <= 12; i++) {
            let className = "";
            if (i === StateManager.GetFeedRecorderData().SelectedHour) className = "selected";
            options.push(
                <button
                    key={"hour-" + i}
                    className={FormatCssClass(className)}
                    onClick={this.changeHourSelection}
                >{i}</button>
            )
        }

        let modalContent = (
            <div className={FormatCssClass("options-hour")}>
                {options}
            </div>
        );

        StateManager.UpdateValue(
            "UI.SelectedModalData",
            {
                AllowDismiss: true,
                Content: modalContent
            }
        );

    }

    // Display a modal allowing selection of a minute.
    displayMinuteSelection(e) {
        e.preventDefault();

        let options = [];
        for (let i = 0; i < 60; i += 5) {
            let className = "";
            if (i <= StateManager.GetFeedRecorderData().SelectedMinute && i > (StateManager.GetFeedRecorderData().SelectedMinute - 5)) className = "selected";
            options.push(
                <button
                    key={"minute-" + i}
                    className={FormatCssClass(className)}
                    onClick={this.changeMinuteSelection}
                >{i.toString().padStart(2, "0")}</button>
            )
        }

        let modalContent = (
            <div className={FormatCssClass("options-minute")}>
                {options}
            </div>
        );

        StateManager.UpdateValue(
            "UI.SelectedModalData",
            {
                AllowDismiss: true,
                Content: modalContent
            }
        );

    }

    // Display a modal allowing selection of a recipe.
    displayRecipeSelection(e) {
        e.preventDefault();

        ApiLoadRecipes(recipes => {

            let options = [];
            recipes.forEach(recipe => {
                if (!recipe.Selectable) return; // skip any inactive recipes

                let lastUsedDate = "Never Used";
                if (recipe.LastUsed) {
                    lastUsedDate = "Last Used " + moment(recipe.LastUsed).format("MMM Do, YYYY");
                }
                let className = "";
                if (recipe.RecipeId === StateManager.GetFeedRecorderData().SelectedRecipeId) className = "selected";
                options.push(
                    <button
                        key={"recipe-" + recipe.RecipeId}
                        className={FormatCssClass(className)}
                        data-recipe-id={recipe.RecipeId}
                        onClick={this.changeRecipeSelection}
                    >{recipe.Name}<small data-recipe-id={recipe.RecipeId}>{lastUsedDate}</small></button>
                );
            });
            options.push(
                <div className={FormatCssClass("recipe-add-area")} key={"recipe-add"}>
                    <button onClick={this.addRecipe}>Add New Recipe</button>
                </div>
            );

            let modalContent = (
                <div className={FormatCssClass("options-recipe")}>
                    {options}
                </div>
            );

            StateManager.UpdateValue(
                "UI.SelectedModalData",
                {
                    AllowDismiss: true,
                    Content: modalContent
                }
            );

        });

    }

    // Updates the hours to the selection.
    changeHourSelection(e) {
        e.preventDefault();

        StateManager.UpdateValue("UI.FeedRecorder.SelectedHour", parseInt(e.target.innerText));
        StateManager.ResetModal();

    }

    // Updates the minutes to the selection.
    changeMinuteSelection(e) {
        e.preventDefault();

        StateManager.UpdateValue("UI.FeedRecorder.SelectedMinute", parseInt(e.target.innerText));
        StateManager.ResetModal();

    }

    // Toggles the time between AM and PM.
    changeAmPmSelection(e) {
        e.preventDefault();

        StateManager.UpdateValue("UI.FeedRecorder.SelectedAmPm", (StateManager.GetFeedRecorderData().SelectedAmPm === "am") ? "pm" : "am");
        StateManager.ResetModal();

    }

    // Updates the recipe to the selection.
    changeRecipeSelection(e) {
        e.preventDefault();

        let buttonData = e.target.dataset;

        StateManager.UpdateValue("UI.FeedRecorder.SelectedRecipeId", parseInt(buttonData.recipeId));

        // change the unit if the recipe changes between recording in calories vs volume
        let selectedRecipe = StateManager.GetRecipeRecord(StateManager.GetFeedRecorderData().SelectedRecipeId);
        let newUnit = "";
        if (selectedRecipe.CaloriesPerOunce > 0)
            newUnit = (StateManager.State().Account.Settings.DisplayVolumeAsMetric) ? "mls" : "ozs";
        else newUnit = "cals";
        if (StateManager.State().UI.FeedRecorder.SelectedVolumeUnit !== newUnit) {
            StateManager.UpdateValue("UI.FeedRecorder.SelectedVolumeUnit", newUnit);
        }

        StateManager.ResetModal();

    }

    // opens menu to add a new recipe
    addRecipe(e) {
        e.preventDefault();

        StateManager.UpdateValue("UI.EditingRecipe.RecipeId", -1);
        StateManager.UpdateValue("UI.SelectedMenuPanel", "recipes");
        StateManager.UpdateValue("UI.IsMenuOpen", true);

    }

    // Change the current selection of the feed volume.
    updateVolume(e) {

        StateManager.UpdateValue(
            "UI.FeedRecorder.SelectedVolume",
            e.target.value
        );

        if (StateManager.State().UI.SelectedModalData.Content) { // only update if the content exists
            StateManager.UpdateValue("UI.SelectedModalData.Content", this.getVolumeWidgetContent(e.target.value));
        }

    }

    // Displays a modal with the selected volume while interacting with the volume changer.
    showVolumeWidget(e) {

        StateManager.UpdateValue(
            "UI.SelectedModalData",
            {
                AllowDismiss: true,
                HideScreen: true,
                FixedToTop: true,
                Content: this.getVolumeWidgetContent(e.target.value)
            }
        );

    }

    // Hides the modal with the selected volume after finished interacting with the volume changer.
    hideVolumeWidget(e) {

        StateManager.ResetModal();

    }

    // Loads the content for the volume widget.
    getVolumeWidgetContent(volume) {

        return (
            <div className={FormatCssClass("volume-widget")}>
                {volume}
            </div>
        );

    }

    // Saves the current selections.
    submitFeed(e) {
        e.preventDefault();

        // validate provided data
        // TODO: Validate time and show feedback if error

        StateManager.UpdateValue("UI.IsSaving", true);

        // find the date - if the time if more than 2 hours into the future, use yesterday, allowing for up to 22
        // hours to enter a past feed
        let date = moment().format("YYYY-MM-DD");
        if (StateManager.GetFeedRecorderData().SelectedHour - 2 > moment().hours())
            date = moment().subtract(1, "days").format("YYYY-MM-DD");

        // add the hours to the date
        let hoursIn24Format = (StateManager.GetFeedRecorderData().SelectedAmPm === "pm" && StateManager.GetFeedRecorderData().SelectedHour !== 12) ? (StateManager.GetFeedRecorderData().SelectedHour + 12) : StateManager.GetFeedRecorderData().SelectedHour;
        date += " " + hoursIn24Format + ":" + StateManager.GetFeedRecorderData().SelectedMinute.toString().padStart(2, "0");

        // prepare the save data for the save
        let selectedRecipe = StateManager.GetRecipeRecord(StateManager.GetFeedRecorderData().SelectedRecipeId);
        let saveData = {
            dateTime: date,
            calories: ConvertVolumeToCalories(
                StateManager.GetFeedRecorderData().SelectedVolume,
                StateManager.GetFeedRecorderData().SelectedVolumeUnit,
                selectedRecipe.CaloriesPerOunce
            ),
            recipeId: StateManager.GetFeedRecorderData().SelectedRecipeId
        };

        // save the feed data
        let self = this;
        ApiSaveFeed(saveData, success => {
            // TODO: Handle non-success

            StateManager.ReloadFromServer();

        });

    }

}
