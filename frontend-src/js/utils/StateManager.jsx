/*
    StateManager
 */

import React from "react";
import {createStore} from "redux";

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
            Id: 0,
            Name: "",
            Notes: "",
            CaloriesPerOunce: 0
        }]
    },
    Babies: {
        Baby0: { // placeholder to be replaced after loading
            BabyId: 0,
            Name: "",
            CaloriesSliderMax: 0,
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
                Id: 0,
                RecipeId: 0,
                DateTime: "",
                Calories: 0
            }],
            Feeds: [{
                Id: 0,
                RecipeId: 0,
                DateTime: "",
                Calories: 0
            }],
            Goals: [{
                Id: 0,
                Date: "",
                CaloriesPerKilogram: 0
            }],
            Weights: [{
                Id: 0,
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
        IsMenuEditFormOpen: false,
        SelectedMenuEditFormData: {},
        ResultsCondensed: true,
        //IsModalOpen: false,
        //SelectedModal: "",
        FeedRecorder: {
            SelectedHour: 0,
            SelectedMinute: 0,
            SelectedAmPm: "am",
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
            newState.DateToday = action.payload.dateToday;
            newState.SelectedBaby = action.payload.babyId;
            newState.Babies["Baby" + newState.SelectedBaby] = JSON.parse(JSON.stringify(newState.Babies.Baby0));
            newState.Babies["Baby" + newState.SelectedBaby].BabyId = action.payload.babyId;
            // newState.Babies["Baby" + newState.SelectedBaby].Name = action.payload.babyName; // TODO: Return from API
            // newState.Babies["Baby" + newState.SelectedBaby].CaloriesSliderMax = CALC; // TODO: Calculate
            newState.Babies["Baby" + newState.SelectedBaby].BirthDate = action.payload.dateBirth;
            newState.Babies["Baby" + newState.SelectedBaby].ExpectedDate = action.payload.dateExpected;
            newState.Babies["Baby" + newState.SelectedBaby].RecipeId = action.payload.recipeId;
            newState.Babies["Baby" + newState.SelectedBaby].DailyTotals = action.payload.feedTotalsPerDay;
            newState.Babies["Baby" + newState.SelectedBaby].LastFeedTime = action.payload.lastFeedTime;
            newState.Babies["Baby" + newState.SelectedBaby].FeedsForToday = action.payload.feedsForToday;
            // newState.Babies["Baby" + newState.SelectedBaby].Feeds = // TODO: Return from API
            // newState.Babies["Baby" + newState.SelectedBaby].Goals = // TODO: Return from API
            newState.Babies["Baby" + newState.SelectedBaby].Weights = action.payload.weights;
            newState.UI.FeedRecorder.SelectedHour = parseInt(moment().format("h"));
            newState.UI.FeedRecorder.SelectedMinute = moment().minute();
            newState.UI.FeedRecorder.SelectedAmPm = moment().format("a");
            break;
    }

    return newState;

};

class StateManager {

    // Constructor.
    constructor(props, context) {
        this.Store = createStore(reducer, storeModel);
    }

    State() {
        return this.Store.getState();
    }

    CopyState() {
        return JSON.parse(JSON.stringify(this.State()));
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

    GetFeedRecorderData() {
        return this.State().UI.FeedRecorder;
    }

}

export default StateManager = new StateManager();
