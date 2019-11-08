/*
    Menu Recipes
    Displays menu options for managing recipes.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";
import StateManager from "../utils/StateManager.jsx";
import RecipeEditor from "./RecipeEditor.jsx";

// export object
export default class MenuRecipes extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);
        this.previousState = {};

        StateManager.Store.subscribe(() => {
            if (StateManager.ValueChanged(this.previousState, [
                    "Account.Recipes",
                    "UI.EditingRecipe"
                ]
            )) this.forceUpdate();
        });

        this.addRecipe = this.addRecipe.bind(this);
        this.editRecipe = this.editRecipe.bind(this);

    };

    // Renders the menu panel.
    render() {

        let content = "";
        if (StateManager.State().Account.Recipes.length) {

            let blocks = [];
            let activeRecipes = [];
            let inactiveRecipes = [];

            StateManager.State().Account.Recipes.forEach(recipe => {
                if (recipe.Selectable) {
                    activeRecipes.push(recipe);
                }
                else {
                    inactiveRecipes.push(recipe);
                }
            });

            if (activeRecipes) {
                blocks.push(
                    <div className={FormatCssClass("recipes-block")} key={"recipes-active"}>
                        <div className={FormatCssClass("recipes-block-contents")}>
                            <h2>Active Recipes</h2>
                            {this.renderRecipeBlocks(activeRecipes)}
                        </div>
                    </div>
                )
            }

            if (inactiveRecipes) {
                blocks.push(
                    <div className={FormatCssClass("recipes-block")} key={"recipes-inactive"}>
                        <div className={FormatCssClass("recipes-block-contents")}>
                            <h2>Inactive Recipes</h2>
                            {this.renderRecipeBlocks(inactiveRecipes)}
                        </div>
                    </div>
                )
            }

            content = blocks;

        }
        else content = <p>No Recipes Defined</p>;

        return (
            <div className={FormatCssClass(["menu-panel-sub", "menu-recipes"])}>
                <div className={FormatCssClass(["menu-panel-edit-form", (StateManager.State().UI.EditingRecipe.RecipeId !== 0) ? "open" : "closed"])}>
                    <RecipeEditor/>
                </div>
                <h1>Recipes</h1>
                <div className={FormatCssClass("content")}>
                    <div className={FormatCssClass("data")}>
                        <button key="button-recipe-add" onClick={this.addRecipe}>Add New Recipe</button>
                        {content}
                    </div>
                    <div className={FormatCssClass("graph")}>[GRAPH]</div>
                </div>
            </div>
        );

    }

    renderRecipeBlocks(recipes) {

        let recipeBlocks = [];
        recipes.forEach(recipe => {

            let lastUsedCell = null;
            if (recipe.LastUsed) {
                lastUsedCell = (
                    <span className={FormatCssClass("cell-last-used")}>
                        <h6>Last Used</h6>
                        <strong>{moment(recipe.LastUsed).format("MMM Do")}</strong>
                    </span>
                );
            }
            else {
                lastUsedCell = (
                    <span className={FormatCssClass("cell-last-used")}>
                        <h6>Never Used</h6>
                    </span>
                )
            }

            recipeBlocks.push(
                <div className={FormatCssClass(["row", (recipeBlocks.length % 2) ? "even" : "odd"])}
                     onClick={this.editRecipe}
                     data-recipe-id={recipe.RecipeId}
                     key={"recipe-" + recipe.RecipeId}>
                    <span className={FormatCssClass("cell-name")}><strong>{recipe.Name}</strong></span>
                    {lastUsedCell}
                    <button className={FormatCssClass("btn-edit")}>^</button>
                </div>
            );
        });

        return recipeBlocks;

    }

    addRecipe(e) {
        e.preventDefault();

        StateManager.UpdateValue(
            "UI.EditingRecipe",
            {
                RecipeId: -1,
                Name: "",
                Notes: "",
                CaloriesPerOunce: 0,
                LastUsed: "",
                Selectable: true
            }
        );

    }

    editRecipe(e) {
        e.preventDefault();

        let recipeId = parseInt(e.currentTarget.dataset.recipeId);

        let editRecipe = {};
        StateManager.State().Account.Recipes.forEach(recipe => {
            if (recipe.RecipeId === recipeId) {
                editRecipe = {...recipe};
                return false;
            }
        });

        StateManager.UpdateValue(
            "UI.EditingRecipe",
            editRecipe
        );

    }

}
