/*
    Menu Feeds
    Displays menu options for managing feeds.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";
import {ConvertCaloriesToVolume, ConvertVolumeToCalories} from "../utils/Converters.jsx";
import StateManager from "../utils/StateManager.jsx";

// import api interactions
import ApiSaveFeed from "../api/SaveFeed.jsx";

// export object
export default class FeedEditor extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);
        this.previousState = {};

        this.unsubscribe = StateManager.Store.subscribe(() => {
            if (StateManager.ValueChanged(this.previousState, [
                    "UI.EditingFeed",
                    "UI.IsSaving"
                ]
            )) this.forceUpdate();
        });

        this.submitFeed = this.submitFeed.bind(this);

    }

    // Unmount actions.
    componentWillUnmount() {
        this.unsubscribe();
    }

    // Renders the menu panel.
    render() {

        let feed = StateManager.State().UI.EditingFeed;
        if (feed.FeedId === 0) return null;

        let title = (feed.FeedId !== -1) ? "Edit Feed" : "Add Feed";

        let optionsRecipes = [];
        let volumeUnit = (StateManager.State().Account.Settings.DisplayVolumeAsMetric) ? "mls" : "ozs";
        let recipeCaloriesPerOunce = 0;
        StateManager.State().Account.Recipes.forEach((recipe) => {
            if (!recipe.Selectable) return;

            if (recipe.RecipeId === feed.RecipeId) {
                recipeCaloriesPerOunce = recipe.CaloriesPerOunce;
                if (!recipeCaloriesPerOunce) volumeUnit = "cals";
            }
            optionsRecipes.push(
                <option key={"option-recipe-" + recipe.RecipeId} value={recipe.RecipeId}>{recipe.Name}</option>
            );

        });

        let volume = ConvertCaloriesToVolume(feed.Calories, volumeUnit, recipeCaloriesPerOunce);

        return (
            <div className={FormatCssClass("panel-form")}>
                <h1>{title}</h1>
                <form className={FormatCssClass("content")} onSubmit={this.submitFeed}>
                    <div className={FormatCssClass("form-fields")}>
                        <h2>Date</h2>
                        <div className={FormatCssClass("fields")}>
                            <input id="input-feed-date" name="inputFeedDate" type="date" defaultValue={feed.Date}/>
                        </div>
                        <h2>Time</h2>
                        <div className={FormatCssClass("fields")}>
                            <input id="input-feed-time" name="inputFeedTime" type="time" defaultValue={feed.Time}/>
                        </div>
                        <h2>Recipe</h2>
                        <div className={FormatCssClass("fields")}>
                            <select id="select-feed-recipe" name="inputFeedRecipe" defaultValue={feed.RecipeId}>{optionsRecipes}</select>
                        </div>
                        <h2>Volume</h2>
                        <div className={FormatCssClass("fields")}>
                            <input id="input-feed-volume" name="inputFeedVolume" type="number" defaultValue={volume}/>
                            <select id="select-feed-volume-unit" name="inputFeedVolumeUnit" defaultValue={volumeUnit}>
                                <option value="mls">Mls</option>
                                <option value="ozs">Ozs</option>
                                <option value="cals">Cals</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className={FormatCssClass("save")} disabled={StateManager.State().UI.IsSaving}>Save</button>
                </form>
            </div>
        );

    }

    submitFeed(e) {
        e.preventDefault();

        StateManager.UpdateValue("UI.IsSaving", true);

        let recipeId = parseInt(e.target.inputFeedRecipe.value);
        let recipeCaloriesPerOunce = 0;
        StateManager.State().Account.Recipes.forEach((recipe) => {
            if (recipe.RecipeId === recipeId) {
                recipeCaloriesPerOunce = recipe.CaloriesPerOunce;
            }
        });

        let feed = StateManager.State().UI.EditingFeed;
        feed.Date = e.target.inputFeedDate.value;
        feed.Time = e.target.inputFeedTime.value;
        feed.RecipeId = recipeId;
        feed.Calories = ConvertVolumeToCalories(
            parseInt(e.target.inputFeedVolume.value),
            e.target.inputFeedVolumeUnit.value,
            recipeCaloriesPerOunce
        );

        ApiSaveFeed({
            feedId: feed.FeedId,
            dateTime: feed.Date + " " + feed.Time,
            calories: feed.Calories,
            recipeId: feed.RecipeId
        }, success => {
            StateManager.UpdateValue("UI.IsSaving", false);
            StateManager.ResetEditingFeed();
        });

    }

}
