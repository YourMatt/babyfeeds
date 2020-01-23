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

        let modalData = StateManager.State().UI.SelectedModalData;
        if (!modalData.Content) return null;

        let screen = "";
        if (!modalData.HideScreen) {
            screen = (
                <div
                    className={FormatCssClass("screen")}
                    onClick={(modalData.AllowDismiss) ? this.dismissModal : () => {}}
                />
            );
        }

        let modalClasses = ["modal"];
        if (modalData.FixedToTop) modalClasses.push("fixed-to-top");

        return (
            <div className={FormatCssClass(modalClasses)}>
                {screen}
                <div className={FormatCssClass("content")}>
                    {modalData.Content}
                </div>
            </div>
        );

    }

    // Removes the modal window.
    dismissModal() {

        // remove the modal from state
        StateManager.ResetModal();

    }

}
