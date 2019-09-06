/*
    Menu Feeds
    Displays menu options for managing feeds.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";
import {ConvertCaloriesToVolume, ConvertVolumeToCalories} from "../utils/Converters.jsx";

// import api interactions
import ApiSaveFeed from "../api/SaveFeed.jsx";

// export object
export default class FeedEditor extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);

        // intialize the state
        this.state = {
            isSaving: false
        };

        this.submitFeed = this.submitFeed.bind(this);

    };

    // Renders the menu panel.
    render() {

        if (!this.props.feed.RecipeId) return null;

        let title = (this.props.feed.FeedId) ? "Edit Feed" : "Add Feed";

        let optionsRecipes = [];
        let volumeUnit = "mls";
        let recipeCaloriesPerOunce = 0;
        this.props.recipes.forEach((recipe) => {
            if (recipe.recipeId === this.props.feed.RecipeId) {
                recipeCaloriesPerOunce = recipe.caloriesPerOunce;
                if (!recipeCaloriesPerOunce) volumeUnit = "cals";
            }
            optionsRecipes.push(
                <option key={"option-recipe-" + recipe.recipeId} value={recipe.recipeId}>{recipe.name}</option>
            );
        });

        let volume = ConvertCaloriesToVolume(this.props.feed.Calories, volumeUnit, recipeCaloriesPerOunce);

        return (
            <div>
                <h1>{title}</h1>
                <form className={FormatCssClass("content")} onSubmit={this.submitFeed}>
                    <div className={FormatCssClass("form-fields")}>
                        <h2>Date</h2>
                        <div className={FormatCssClass("fields")}>
                            <input id="input-feed-date" name="inputFeedDate" type="date" defaultValue={this.props.feed.Date}/>
                        </div>
                        <h2>Time</h2>
                        <div className={FormatCssClass("fields")}>
                            <input id="input-feed-time" name="inputFeedTime" type="time" defaultValue={this.props.feed.Time}/>
                        </div>
                        <h2>Recipe</h2>
                        <div className={FormatCssClass("fields")}>
                            <select id="select-feed-recipe" name="inputFeedRecipe" defaultValue={this.props.feed.RecipeId}>{optionsRecipes}</select>
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
                    <button type="submit" className={FormatCssClass("save")} disabled={this.state.isSaving}>Save</button>
                </form>
            </div>
        );

    }

    submitFeed(e) {
        e.preventDefault();

        this.setState({
            isSaving: true
        });

        let recipeId = parseInt(e.target.inputFeedRecipe.value);
        let recipeCaloriesPerOunce = 0;
        this.props.recipes.forEach((recipe) => {
            if (recipe.recipeId === recipeId) {
                recipeCaloriesPerOunce = recipe.caloriesPerOunce;
            }
        });

        let feed = this.props.feed;
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
            console.log("saved!");
        });

    }

}
