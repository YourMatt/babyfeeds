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
import FormatCssClass from "../utils/FormatCssClass.jsx";

// export object
export default class Menu extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);

        // intialize the state
        this.state = {
            menuClosed: false, // change to true after testing
            displayedPanel: "" // the name of the panel to display, if any
        };

        // bind event handlers
        this.changeOpenCloseStatus = this.changeOpenCloseStatus.bind(this);
        this.openPanel = this.openPanel.bind(this);

    };

    // Renders the menu.
    render() {

        // load the menu selection
        let displayPanelContents = "";
        switch (this.state.displayedPanel) {
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

        // return jsx
        return (
            <div className={FormatCssClass("menu-area")}>
                <div className={FormatCssClass("menu-open-close")}>
                    <button className={FormatCssClass(["hamburger", "hamburger--squeeze", (this.state.menuClosed) ? "" : "is-active"])}
                            type="button"
                            onClick={this.changeOpenCloseStatus}>
                      <span className={FormatCssClass("hamburger-box")}>
                          <span className={FormatCssClass("hamburger-inner")}></span>
                      </span>
                    </button>
                </div>
                <div className={FormatCssClass(["menu", (this.state.menuClosed) ? "" : "open"])}>
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

        let newClosedStatus = !this.state.menuClosed;

        this.setState({
            menuClosed: newClosedStatus,
            displayedPanel: (newClosedStatus) ? "" : this.state.displayedPanel // hide sub-panels if changing to closed
        });

    }

    // Handles panel selection.
    openPanel(e) {

        this.setState({
            displayedPanel: e.target.dataset.panel
        });

    }

}
