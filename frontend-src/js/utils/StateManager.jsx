/*
    StateManager
 */

import React from "react";
import {createStore} from "redux";

// import utilities
import {ConvertCaloriesToVolume} from "./Converters.jsx";

// import api interactions
import ApiLoad from "../api/Load.jsx";

// build the initial state
const storeModel = {
    DateToday: "",
    SelectedBaby: 0,
    Account: {
        AccountId: 0,
        Name: "",
        Email: "",
        CreateDate: "",
        Settings: {
            DisplayAgeAsAdjusted: false,
            DisplayVolumeAsMetric: false,
            DisplayWeightAsMetric: false
        },
        Recipes: [{ // placeholder to be replaced after loading
            RecipeId: 0,
            Name: "",
            Notes: "",
            CaloriesPerOunce: 0,
            LastUsed: "",
            Selectable: false
        }]
    },
    Babies: {
        Baby0: { // placeholder to be replaced after loading
            BabyId: 0,
            Name: "",
            CaloriesSliderMax: 0,
            CaloriesFeedMax: 0, // TODO: Evaluate if still needed
            CaloriesGoal: 0, // TODO: Remove after adding goals load
            BirthDate: "",
            ExpectedDate: "",
            RecipeId: 0,
            DailyTotals: [{
                Date: "",
                GoalCalories: 0,
                TotalCalories: 0
            }],
            LastFeedTime: "",
            FeedsForToday: [{
                FeedId: 0,
                RecipeId: 0,
                DateTime: "",
                Calories: 0
            }],
            Feeds: [{
                FeedId: 0,
                RecipeId: 0,
                Date: "",
                Time: "",
                Calories: 0
            }],
            Goals: [{
                GoalId: 0,
                Date: "",
                CaloriesPerKilogram: 0
            }],
            Weights: [{
                WeightId: 0,
                Date: "",
                Kilograms: 0
            }]
        }
    },
    UI: {
        IsLoading: true,
        IsSaving: false,
        IsMenuOpen: false,
        SelectedMenuPanel: "",
        EditingFeed: {
            FeedId: 0,
            RecipeId: 0,
            Date: "",
            Time: "",
            Calories: 0
        },
        EditingRecipe: {
            RecipeId: 0, // set to -1 for NEW
            Name: "",
            Notes: "",
            CaloriesPerOunce: 0,
            LastUsed: "",
            Selectable: false
        },
        ResultsCondensed: true,
        FeedRecorder: {
            SelectedRecipeId: 0,
            SelectedHour: 0,
            SelectedMinute: 0,
            SelectedAmPm: "am", // can be: am, pm
            SelectedVolume: 0,
            SelectedVolumeUnit: "mls" // can be: cals, mls, ozs
        },
        SelectedModalData: {
            AllowDismiss: false,
            Content: ""
        }
    }
};

// define the reducer
const reducer = (state, action) => {

    // copy the current state to a new state
    let newState = {...state};

    // modify the state based from the action type
    switch (action.type) {
        case "UPDATE_VALUE":
            eval("newState." + action.item + " = action.payload.value");
            break;
        case "RESET_SERVER_DATA":

            // get volume data from recipes
            let selectedVolume = 0;
            let selectedRecipeCaloriesPerOunce = 0;
            let selectedRecipeVolumeUnit = "";
            for (let recipe of action.payload.recipes) {
                if (recipe.RecipeId === action.payload.recipeId) {
                    selectedRecipeCaloriesPerOunce = recipe.CaloriesPerOunce;
                    selectedRecipeVolumeUnit = (selectedRecipeCaloriesPerOunce) ? ((true) ? "mls" : "ozs") : "cals"; // TODO: Use display as metric from API
                    selectedVolume = ConvertCaloriesToVolume(action.payload.caloriesLastFeed, selectedRecipeVolumeUnit, selectedRecipeCaloriesPerOunce);
                    break;
                }
            }

            newState.DateToday = action.payload.dateToday;
            newState.SelectedBaby = action.payload.babyId;
            newState.Account.Settings.DisplayVolumeAsMetric = true; // TODO: Return from API
            newState.Account.Recipes = action.payload.recipes;
            newState.Babies["Baby" + newState.SelectedBaby] = JSON.parse(JSON.stringify(newState.Babies.Baby0));
            newState.Babies["Baby" + newState.SelectedBaby].BabyId = action.payload.babyId;
            // newState.Babies["Baby" + newState.SelectedBaby].Name = action.payload.babyName; // TODO: Return from API
            // newState.Babies["Baby" + newState.SelectedBaby].CaloriesSliderMax = CALC; // TODO: Calculate
            newState.Babies["Baby" + newState.SelectedBaby].CaloriesFeedMax = action.payload.caloriesFeedMax; // TODO: Evaluate if still needed
            newState.Babies["Baby" + newState.SelectedBaby].CaloriesGoal = action.payload.caloriesGoal; // TODO: Remove and replace with goals list
            newState.Babies["Baby" + newState.SelectedBaby].BirthDate = action.payload.dateBirth;
            newState.Babies["Baby" + newState.SelectedBaby].ExpectedDate = action.payload.dateExpected;
            newState.Babies["Baby" + newState.SelectedBaby].RecipeId = action.payload.recipeId;
            newState.Babies["Baby" + newState.SelectedBaby].DailyTotals = action.payload.feedTotalsPerDay;
            newState.Babies["Baby" + newState.SelectedBaby].LastFeedTime = action.payload.lastFeedTime;
            newState.Babies["Baby" + newState.SelectedBaby].FeedsForToday = action.payload.feedsForToday;
            // newState.Babies["Baby" + newState.SelectedBaby].Feeds = // TODO: Return from API
            // newState.Babies["Baby" + newState.SelectedBaby].Goals = // TODO: Return from API
            newState.Babies["Baby" + newState.SelectedBaby].Weights = action.payload.weights;
            newState.UI.IsLoading = false;
            newState.UI.IsSaving = false;
            newState.UI.FeedRecorder.SelectedRecipeId = action.payload.recipeId;
            newState.UI.FeedRecorder.SelectedHour = parseInt(moment().format("h"));
            newState.UI.FeedRecorder.SelectedMinute = moment().minute();
            newState.UI.FeedRecorder.SelectedAmPm = moment().format("a");
            newState.UI.FeedRecorder.SelectedVolume = selectedVolume;
            newState.UI.FeedRecorder.SelectedVolumeUnit = selectedRecipeVolumeUnit;
            break;
    }

    return newState;

};

class StateManager {

    // Constructor.
    constructor() {
        this.Store = createStore(reducer, storeModel);
    }

    State() {
        return this.Store.getState();
    }

    CopyState() {
        return JSON.parse(JSON.stringify(this.State()));
    }

    ReloadFromServer(callback) {
        ApiLoad(data => {
            this.Store.dispatch({
                type: "RESET_SERVER_DATA",
                payload: data
            });
            if (callback) callback();
        });
    }

    UpdateValue(modelPath, newValue) {
        this.Store.dispatch({
            type: "UPDATE_VALUE",
            item: modelPath,
            payload: {
                value: newValue
            }
        });
    }

    ResetEditingRecipe() {
        this.UpdateValue(
            "UI.EditingRecipe",
            {
                RecipeId: 0, // set to -1 for NEW
                Name: "",
                Notes: "",
                CaloriesPerOunce: 0,
                LastUsed: "",
                Selectable: false
            }
        );
    }
    ResetEditingFeed() {
        this.UpdateValue(
            "UI.EditingFeed",
            {
                FeedId: 0, // set to -1 for NEW
                RecipeId: 0,
                Date: "",
                Time: "",
                Calories: 0
            }
        );
    }

    ValueChanged(oldState, path) {
        if (typeof oldState === "undefined" || !oldState.UI) return true;

        // path can be a single string or an array of strings - if a single, convert to a single-length array
        if (!Array.isArray(path)) path = [path];

        for (let i = 0; i < path.length; i++) {

            let pathParts = path[i].split(".");
            let pathPart = "";
            let oldValue = oldState;
            let newValue = this.CopyState();
            while (pathParts.length) {
                pathPart = pathParts.shift();
                oldValue = oldValue[pathPart];
                newValue = newValue[pathPart];
                /* keep temporarily for debug purposes
                if (path[i] == "Babies.Baby1.Weights" && pathPart == "Weights") {
                    console.log("Hit iteration for: " + pathPart);
                    console.log("Old:");
                    console.log(oldValue);
                    console.log("New:");
                    console.log(newValue);
                }
                 */
            }

            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                // if (pathPart == "Weights") console.log("Returning true to force update.");
                return true;
            }
            // else if (pathPart == "Weights") console.log("Returning false to reject update.");

        }

        return false;

    }

    GetCurrentBabyDetails() {
        return this.State().Babies["Baby" + this.State().SelectedBaby];
    }

    GetCurrentBabyWeight() {
        return this.GetCurrentBabyDetails().Weights[this.GetCurrentBabyDetails().Weights.length - 1].Kilograms;
    }
    GetCurrentBabyWeightRecord() {
        return this.GetCurrentBabyDetails().Weights[this.GetCurrentBabyDetails().Weights.length - 1];
    }

    GetRecipeRecord(recipeId) {
        let selectedRecipe = {};
        for (let recipe of this.State().Account.Recipes) {
            if (recipe.RecipeId === recipeId) {
                selectedRecipe = {...recipe};
                break;
            }
        }
        return selectedRecipe;
    }

    GetFeedRecorderData() {
        return this.State().UI.FeedRecorder;
    }

}

export default StateManager = new StateManager();
