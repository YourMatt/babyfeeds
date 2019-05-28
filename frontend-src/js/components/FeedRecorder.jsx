/*
    FeedRecorder
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";

// import api interactions
import ApiSaveFeed from "../api/SaveFeed.jsx";

export default class FeedRecorder extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);

        // intialize the application state
        this.state = {
            isSaving: false,
            selectedVolume: 0,
            selectedHour: moment().hour(),
            selectedMinute: moment().minute(),
            selectedAmPm: moment().format("a"),
        };

        // reload the data after regaining focus
        let self = this;
        document.addEventListener("visibilitychange", function() {
            let state = document.visibilityState || document.webkitVisibilityState;
            if (state === "visible") {
                self.props.fnReloadData(() => {
                    self.setState({
                        selectedHour: moment().hour(),
                        selectedMinute: moment().minute(),
                        selectedAmPm: moment().format("a")
                    })
                });
            }
        });

        this.updateVolume = this.updateVolume.bind(this);
        this.displayHourSelection = this.displayHourSelection.bind(this);
        this.displayMinuteSelection = this.displayMinuteSelection.bind(this);
        this.changeHourSelection = this.changeHourSelection.bind(this);
        this.changeMinuteSelection = this.changeMinuteSelection.bind(this);
        this.changeAmPmSelection = this.changeAmPmSelection.bind(this);
        this.submitFeed = this.submitFeed.bind(this);

    };

    // Changes when updating component.
    componentDidUpdate() {

        // set the volume selection if provided by props
        if (!this.state.selectedVolume && this.props.lastFeedVolume) {
            this.setState({
                selectedVolume: this.props.lastFeedVolume
            });
        }

    }

    // Renders the feed recorder.
    render() {

        // find the total volume for the day
        let totalFeeds = 0;
        this.props.feedsForToday.forEach((value) => {
            totalFeeds += value.Milliliters;
        });

        // find the remaining amount
        let remainingMls = (totalFeeds < this.props.feedRequiredForToday) ? (this.props.feedRequiredForToday - totalFeeds) : 0;
        let pluralRemainingMls = (remainingMls === 1) ? "" : "s";

        let currentVolume = this.state.selectedVolume;
        let volumeMax = this.props.maxFeedVolume + 20; // TODO: Change to vary by percentage, ending in even numbers - maybe set a minimum based upon the baby's weight for new signups

        // return jsx
        return (
            <div className={FormatCssClass("feed-recorder")}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 100 100"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <clipPath id="bottle-clip-path">
                            <path d="M93.25,37H87.6V28.52c0-1.77-2.15-3.21-4.82-3.21H81.47c-4-3.66-10.67-6.54-18.87-8h0c-1.37-1.07-2.15-3.2-2.09-5.74h0a5.38,5.38,0,0,0,.9-2.94C61.4,4.4,56.29,1,50,1S38.6,4.4,38.6,8.6a5.4,5.4,0,0,0,.87,2.89v0c.08,2.56-.73,4.71-2.11,5.79h0c-8.17,1.48-14.88,4.36-18.82,8H17.22c-2.67,0-4.82,1.44-4.82,3.21V37H6.75C3.58,37,1,38.76,1,40.88V95.16C1,97.28,3.58,99,6.75,99h86.5C96.42,99,99,97.28,99,95.16V40.88C99,38.76,96.42,37,93.25,37Z"/>
                        </clipPath>
                        <linearGradient id="bottle-background" x1="20%" y1="0%" x2="80%" y2="100%">
                            <stop offset="0%" stopColor="#FFF" />
                            <stop offset="100%" stopColor="#CCC" />
                        </linearGradient>
                        <linearGradient id="bottle-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFF8C9" />
                            <stop offset="100%" stopColor="#F7E888" />
                        </linearGradient>
                    </defs>
                    <g className="bottle-clipped">
                        <rect className={FormatCssClass("bottle-background")} x="0" y="0" width="100%" height="100%"/>
                        <g id="bottle-fills">
                            {this.buildSvgFeedVolumeBlocks(this.props.feedRequiredForToday, this.props.feedsForToday)}
                        </g>
                    </g>
                </svg>
                <div className={FormatCssClass("areas")}>
                    <div className={FormatCssClass("remaining")}>
                        <h2>{remainingMls}<small>ML{pluralRemainingMls}</small></h2>
                        <h3>Remaining</h3>
                    </div>
                    <form
                        className={FormatCssClass("input")}
                        onSubmit={this.submitFeed}
                    >
                        <div className={FormatCssClass("time")}>
                            <button onClick={this.displayHourSelection}>{this.state.selectedHour}</button>
                            :
                            <button onClick={this.displayMinuteSelection}>{this.state.selectedMinute.toString().padStart(2, "0")}</button>
                            <button className={FormatCssClass("small")} onClick={this.changeAmPmSelection}>{this.state.selectedAmPm}</button>
                        </div>
                        <div className={FormatCssClass("volume-control")}>
                            <div className={FormatCssClass("volume")}>
                                {currentVolume}<small>ML{(currentVolume === 1) ? "" : "s"}</small>
                            </div>
                            <div className={FormatCssClass("slider")}>
                                <input
                                    type="range"
                                    min="1"
                                    max={volumeMax}
                                    value={currentVolume}
                                    onChange={this.updateVolume}
                                />
                            </div>
                        </div>
                        <div className={FormatCssClass("button")}>
                            <button type="submit" disabled={this.state.isSaving}>Save</button>
                        </div>
                    </form>
                </div>
            </div>
        );

    }

    // Creates the SVG blocks that represent each feed for the date.
    buildSvgFeedVolumeBlocks(totalFeedsRequired, feedsForToday) {

        let currentPercent = 100;
        let feedBlocks = [];
        feedsForToday.forEach((value) => {

            let feedPercent = 100 * value.Milliliters / totalFeedsRequired;
            currentPercent -= feedPercent;

            feedBlocks.push(
                <rect
                    key={value.Time}
                    className="bottle-fill"
                    y={currentPercent}
                    width="100"
                    height={feedPercent}
                />
            );

        });
        feedBlocks.push(
            <rect
                key="TopBorder"
                className={FormatCssClass("bottle-fill-topline")}
                y={currentPercent - 1}
                width="100"
                height="1"
            />
        );

        return feedBlocks;

    }

    // Display a modal allowing selection of an hour.
    displayHourSelection(e) {
        e.preventDefault();

        let options = [];
        for (let i = 1; i <= 12; i++) {
            options.push(
                <button
                    key={"hour-" + i}
                    onClick={this.changeHourSelection}
                >{i}</button>
            )
        }

        let modalContent = (
            <div className={FormatCssClass("options-hour")}>
                {options}
            </div>
        );

        this.props.fnDisplayModal({
            allowDismiss: true,
            content: modalContent
        });

    }

    // Display a modal allowing selection of a minute.
    displayMinuteSelection(e) {
        e.preventDefault();

        let options = [];
        for (let i = 0; i < 60; i += 5) {
            options.push(
                <button
                    key={"minute-" + i}
                    onClick={this.changeMinuteSelection}
                >{i.toString().padStart(2, "0")}</button>
            )
        }

        let modalContent = (
            <div className={FormatCssClass("options-minute")}>
                {options}
            </div>
        );

        this.props.fnDisplayModal({
            allowDismiss: true,
            content: modalContent
        });

    }

    // Updates the hours to the selection.
    changeHourSelection(e) {
        e.preventDefault();

        this.props.fnDismissModal();
        this.setState({
            selectedHour: parseInt(e.target.innerText)
        });

    }

    // Updates the minutes to the selection.
    changeMinuteSelection(e) {
        e.preventDefault();

        this.props.fnDismissModal();
        this.setState({
            selectedMinute: parseInt(e.target.innerText)
        });

    }

    // Toggles the time between AM and PM.
    changeAmPmSelection(e) {
        e.preventDefault();

        this.setState({
            selectedAmPm: (this.state.selectedAmPm === "am") ? "pm" : "am"
        });

    }

    // Change the current selection of the feed volume.
    updateVolume(e) {

        this.setState({selectedVolume: e.target.value});

    }

    // Saves the current selections.
    submitFeed(e) {
        e.preventDefault();

        // validate provided data
        // TODO: Validate time and show feedback if error
        if (!this.state.selectedVolume) return;

        // set state to saving to disable the form
        this.setState({
            isSaving: true
        });

        // find the date - if the time if more than 2 hours into the future, use yesterday, allowing for up to 22
        // hours to enter a past feed
        let date = moment().format("YYYY-MM-DD");
        if (this.state.selectedHour - 2 > moment().hours())
            date = moment().subtract(1, "days").format("YYYY-MM-DD");

        // add the hours to the date
        let hoursIn24Format = (this.state.selectedAmPm === "pm" && this.state.selectedHour !== 12) ? (this.state.selectedHour + 12) : this.state.selectedHour;
        date += " " + hoursIn24Format + ":" + this.state.selectedMinute.toString().padStart(2, "0");

        // save the feed data
        let self = this;
        ApiSaveFeed({
            dateTime: date,
            milliliters: this.state.selectedVolume
        }, success => {

            // TODO: Handle non-success

            self.props.fnReloadData(() => {
                self.setState({
                    selectedHour: moment().hour(),
                    selectedMinute: moment().minute(),
                    selectedAmPm: moment().format("a"),
                    isSaving: false
                });
            });

        });

    }

}
