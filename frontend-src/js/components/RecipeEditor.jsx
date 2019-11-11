/*
    Recipe Editor
    Displays edit form for a recipe.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";
import StateManager from "../utils/StateManager.jsx";
import {DefaultRecipeCaloriesPerOunce} from "../utils/Constants.jsx";

// import api interactions
import ApiLoadRecipes from "../api/LoadRecipes.jsx";
import ApiSaveRecipe from "../api/SaveRecipe.jsx";

// export object
export default class RecipeEditor extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);
        this.previousState = {};

        StateManager.Store.subscribe(() => {
            if (StateManager.ValueChanged(this.previousState, [
                    "UI.EditingRecipe",
                    "UI.IsSaving"
                ]
            )) this.forceUpdate();
        });

        this.submitRecipe = this.submitRecipe.bind(this);
        this.changeActiveStatus = this.changeActiveStatus.bind(this);
        this.setCalorieTypeToVariable = this.setCalorieTypeToVariable.bind(this);
        this.setCalorieTypeToVolume = this.setCalorieTypeToVolume.bind(this);

    };

    // Renders the menu panel.
    render() {

        let recipe = StateManager.State().UI.EditingRecipe;
        if (recipe.RecipeId === 0) return null;

        let title = (recipe.RecipeId !== -1) ? "Edit Recipe" : "Add Recipe";

        // set content for the control to toggle active status if editing
        let activationControl = null;
        if (recipe.RecipeId > 0) {
            if (StateManager.State().UI.EditingRecipe.Selectable) {
                activationControl = (
                    <div className={FormatCssClass("activation-control")}>
                        <hr/>
                        <p>Deactivating a recipe will make it no longer selectable when adding recipes, but all
                            historical data will be retained. You can reactivate a recipe at any time.</p>
                        <button type="button" className={FormatCssClass("deactivate")}
                                disabled={StateManager.State().UI.IsSaving} onClick={this.changeActiveStatus}>Deactivate
                        </button>
                    </div>);
            }
            else {
                activationControl = (
                    <div className={FormatCssClass("activation-control")}>
                        <hr/>
                        <p>Activating a recipe will make it selectable when adding recipes. You can deactivate the
                            recipe again at any time.</p>
                        <button type="button" className={FormatCssClass("activate")}
                                disabled={StateManager.State().UI.IsSaving} onClick={this.changeActiveStatus}>Activate
                        </button>
                    </div>);
            }
        }

        return (
            <div className={FormatCssClass("panel-form")}>
                <h1>{title}</h1>
                <form className={FormatCssClass("content")} onSubmit={this.submitRecipe}>
                    <div className={FormatCssClass("form-fields")}>
                        <h2>Name</h2>
                        <div className={FormatCssClass("fields")}>
                            <input id="input-recipe-name" name="inputRecipeName" defaultValue={recipe.Name}
                                   maxLength="50" required/>
                        </div>
                        <h2>Calories</h2>
                        <div className={FormatCssClass(["fields", "calorie-options"])}>
                            <div className={FormatCssClass(["calorie-option-selection", (recipe.CaloriesPerOunce > 0) ? "" : "selected"])}
                                 onClick={this.setCalorieTypeToVariable}>
                                <h6>Variable</h6>
                                <p>When entering a new feed, you will need to enter the number of calories when this recipe is selected.</p>
                            </div>
                            <div className={FormatCssClass("calorie-option-label-or")}>or</div>
                            <div className={FormatCssClass(["calorie-option-selection", (recipe.CaloriesPerOunce > 0) ? "selected" : ""])}
                                 onClick={this.setCalorieTypeToVolume}>
                                <h6>By Volume</h6>
                                <p>Set the calorie density to select {(StateManager.State().Account.Settings.DisplayVolumeAsMetric) ? "MLs" : "OZs"} when entering a new feed.</p>
                                <div className={FormatCssClass("calorie-option-selection-fields")}>
                                    <input id="input-recipe-calories-per-ounce" name="inputRecipeCalories" value={recipe.CaloriesPerOunce} type="number"
                                           min={(recipe.CaloriesPerOunce > 0) ? "1" : "0"}
                                           max={(recipe.CaloriesPerOunce > 0) ? "99" : "0"}
                                           onChange={e => {StateManager.UpdateValue("UI.EditingRecipe.CaloriesPerOunce", parseInt(e.target.value));}}/>
                                    cal{(recipe.CaloriesPerOunce === 1) ? "" : "s"}/oz
                                </div>
                            </div>
                        </div>
                        <h2>Notes</h2>
                        <div className={FormatCssClass("fields")}>
                            <textarea id="input-recipe-notes" name="inputRecipeNotes" defaultValue={recipe.Notes} maxLength="2000"/>
                        </div>
                    </div>
                    <button type="submit" className={FormatCssClass("save")} disabled={StateManager.State().UI.IsSaving}>Save</button>
                    {activationControl}
                </form>
            </div>
        );

    }

    submitRecipe(e) {
        e.preventDefault();

        StateManager.UpdateValue("UI.IsSaving", true);

        ApiSaveRecipe(
            {
                recipeId: StateManager.State().UI.EditingRecipe.RecipeId,
                name: e.target.inputRecipeName.value,
                caloriesPerOunce: parseInt(e.target.inputRecipeCalories.value),
                notes: e.target.inputRecipeNotes.value,
                selectable: StateManager.State().UI.EditingRecipe.Selectable
            },
            success => {
                ApiLoadRecipes(recipes => {
                    StateManager.UpdateValue("Account.Recipes", recipes);
                    StateManager.ResetEditingRecipe();
                    StateManager.UpdateValue("UI.IsSaving", false);
                });
            }
        );

    }

    changeActiveStatus(e) {
        e.preventDefault();

        console.log("changing active status");

    }

    setCalorieTypeToVariable(e) {
        e.preventDefault();
        if (StateManager.State().UI.EditingRecipe.CaloriesPerOunce === 0) return;

        StateManager.UpdateValue("UI.EditingRecipe.CaloriesPerOunce", 0);

    }

    setCalorieTypeToVolume(e) {
        e.preventDefault();
        if (StateManager.State().UI.EditingRecipe.CaloriesPerOunce > 0) return;

        StateManager.UpdateValue("UI.EditingRecipe.CaloriesPerOunce", DefaultRecipeCaloriesPerOunce);

    }

}
