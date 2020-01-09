/*
    Modal
    Displays a modal window.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";
import StateManager from "../utils/StateManager.jsx";

// export object
export default class Modal extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);
        this.previousState = {};

        this.unsubscribe = StateManager.Store.subscribe(() => {
            if (StateManager.ValueChanged(this.previousState, [
                    "UI.SelectedModalData"
                ]
            )) this.forceUpdate();
        });

        // bind event handlers
        this.dismissModal = this.dismissModal.bind(this);

    }

    // Unmount actions.
    componentWillUnmount() {
        this.unsubscribe();
    }

    // Renders the modal window.
    render() {

        if (!StateManager.State().UI.SelectedModalData.Content) return null;

        return (
            <div className={FormatCssClass("modal")}>
                <div
                    className={FormatCssClass("screen")}
                    onClick={(StateManager.State().UI.SelectedModalData.AllowDismiss) ? this.dismissModal : () => {}}
                />
                <div className={FormatCssClass("content")}>
                    {StateManager.State().UI.SelectedModalData.Content}
                </div>
            </div>
        );

    }

    // Removes the modal window.
    dismissModal() {

        // remove the modal from state
        StateManager.UpdateValue("UI.SelectedModalData.Content", "");

    }

}
