/*
    Menu
    Displays the menu of options.
 */

import React, {Component} from "react";

// import components
import MenuBabies from "./MenuBabies.jsx";
import MenuFeeds from "./MenuFeeds.jsx";
import MenuWeights from "./MenuWeights.jsx";
import MenuRecipes from "./MenuRecipes.jsx";
import MenuAccount from "./MenuAccount.jsx";
import MenuAbout from "./MenuAbout.jsx";

// import utilities
import ApiLoadFeeds from "../api/LoadFeeds.jsx";
import FormatCssClass from "../utils/FormatCssClass.jsx";
import StateManager from "../utils/StateManager.jsx";

// export object
export default class Menu extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);
        this.previousState = {};

        this.unsubscribe = StateManager.Store.subscribe(() => {
            if (StateManager.ValueChanged(this.previousState, [
                    "UI.IsMenuOpen",
                    "UI.IsSubMenuOpen"
                ]
            )) this.forceUpdate();
        });

        // bind event handlers
        this.changeOpenCloseStatus = this.changeOpenCloseStatus.bind(this);
        this.openPanel = this.openPanel.bind(this);

    }

    // Unmount actions.
    componentWillUnmount() {
        this.unsubscribe();
    }

    // Renders the menu.
    render() {

        // load the menu selection
        let displayPanelContents = "";
        switch (StateManager.State().UI.SelectedMenuPanel) {
            case "babies":
                displayPanelContents = <MenuBabies/>;
                break;
            case "feeds":
                displayPanelContents = <MenuFeeds/>;
                break;
            case "weights":
                displayPanelContents = <MenuWeights/>;
                break;
            case "recipes":
                displayPanelContents = <MenuRecipes/>;
                break;
            case "account":
                displayPanelContents = <MenuAccount/>;
                break;
            case "about":
                displayPanelContents = <MenuAbout/>;
                break;
        }

        // set the hamburger close style
        let hamburgerCloseStyle = "hamburger--squeeze"; // standard close X for top-level menu
        if (StateManager.State().UI.SelectedMenuPanel) hamburgerCloseStyle = "hamburger--arrowalt"; // return with arrow for sub-menus

        // return jsx
        return (
            <div className={FormatCssClass("menu-area")}>
                <div className={FormatCssClass("menu-open-close")}>
                    <button className={FormatCssClass(["hamburger", hamburgerCloseStyle, (StateManager.State().UI.IsMenuOpen) ? "is-active" : ""])}
                            type="button"
                            onClick={this.changeOpenCloseStatus}>
                        <span className={FormatCssClass("hamburger-box")}>
                            <span className={FormatCssClass("hamburger-inner")}></span>
                        </span>
                    </button>
                </div>
                <div className={FormatCssClass(["menu", (StateManager.State().UI.IsMenuOpen) ? "open" : ""])}>
                    <div className={FormatCssClass("menu-panel-main")}>
                        <h1>Menu</h1>
                        <ul>
                            <li><button type="button"
                                        data-panel="babies"
                                        onClick={this.openPanel}>Babies</button></li>
                            <li><button type="button"
                                        data-panel="feeds"
                                        onClick={this.openPanel}>Feed History</button></li>
                            <li><button type="button"
                                        data-panel="weights"
                                        onClick={this.openPanel}>Weight</button></li>
                            <li><button type="button"
                                        data-panel="recipes"
                                        onClick={this.openPanel}>Recipes</button></li>
                            <li><button type="button"
                                        data-panel="account"
                                        onClick={this.openPanel}>Account Info</button></li>
                            <li><button type="button"
                                        data-panel="about"
                                        onClick={this.openPanel}>About Cooper Eats</button></li>
                        </ul>
                    </div>
                    {displayPanelContents}
                </div>
            </div>
        );

    }

    // Handles open/close events.
    changeOpenCloseStatus(e) {

        // open the menu if not already open
        if (!StateManager.State().UI.IsMenuOpen) {
            return StateManager.UpdateValue("UI.IsMenuOpen", true);
        }

        // go back if a menu panel is selected
        if (StateManager.State().UI.SelectedMenuPanel) {

            // return to recipes if on the recipe add/edit screen
            if (StateManager.State().UI.EditingRecipe.RecipeId !== 0) {
                return StateManager.UpdateValue("UI.EditingRecipe.RecipeId", 0);
            }

            // return to the base menu if not on any add/edit screens
            else {
                return StateManager.UpdateValue("UI.SelectedMenuPanel", "");
            }

        }

        // close the menu if on the base options panels
        else {
            StateManager.UpdateValue("UI.IsMenuOpen", false);
        }

    }

    // Handles panel selection.
    openPanel(e) {

        let panel = e.target.dataset.panel;

        // load feeds before opening the panel
        if (panel ===  "feeds") {
            ApiLoadFeeds(feedData => {
                StateManager.UpdateValue("Babies.Baby" + StateManager.State().SelectedBaby + ".Feeds", feedData);
                StateManager.UpdateValue("UI.SelectedMenuPanel", panel);
            });
            return;
        }

        StateManager.UpdateValue("UI.SelectedMenuPanel", e.target.dataset.panel);

    }

}
