$(function(){

    babyFeeds.init();

});

var babyFeeds = {

    init: function() {

        babyFeeds.ui.updateFeedVolumeLabel();
        $("#input-feed-volume").off().bind("input", babyFeeds.ui.updateFeedVolumeLabel);

        $("#button-feed-save").off().click(babyFeeds.userActions.saveFeed);

        babyFeeds.server.load(function(data) {
            console.log(data);

            // display controls
            $("#bottle-area").show();
            $("#feed-area").show();
            babyFeeds.ui.buildTimeInput();
            babyFeeds.ui.buildHistoryCalendars();

            // add the background indicator for each feed
            var totalFeedToday = 0;
            var fills = "";
            var maxY = 27;
            var minY = 138;
            var totalSpan = minY - maxY;
            $(data.feedsForToday).each(function(key, feed) {
                totalFeedToday += feed.Milliliters;

                // set position for the fills
                var percent = feed.Milliliters / data.feedRequiredForToday;
                var posY = minY - totalSpan * percent;
                var height = totalSpan * percent;
                minY -= height;

                // create the fill
                fills += "<rect class=\"bottle-fill-" + (key % 2 + 1) + "\" y=\"" + posY + "\" width=\"75\" height=\"" + height + "\"/>";

            });
            $("#bottle-fills").html(fills);

            // set the amount remaining for today
            var mlsRemaining = data.feedRequiredForToday - totalFeedToday;
            if (mlsRemaining > 0) {
                $("#remaining-today-area span").text(mlsRemaining);
            }
            else {

                // remove the remaining amoun text
                $("#remaining-today-area").hide();

                // blink the overflow area
                var blinkIteration = 0;
                var blink = function() {
                    if (blinkIteration++ % 2) $("#bottle-overflow").show();
                    else $("#bottle-overflow").hide();
                    if (blinkIteration < 8) window.setTimeout(blink, 500);
                };
                blink();

            }

            // add the historical data to the calendar
            $(data.feedTotalsPerDay).each(function(key, feed) {
                var calendarDate = moment(feed.Date).format("MM/DD/YYYY");
                var percent = feed.Percent;

                // create tiers correlating with the percentage eaten to show red-green for bad-good
                var tier = 10;
                var level = 1;
                for (var i = 70; i < 110; i += 5) {
                    if (percent < i) {
                        tier = level;
                        break;
                    }
                    level++;
                }

                // add the tier and percentage to the calendar date
                $(".day[data-day=" + calendarDate.replace(/\//g, "\\/") + "]")
                .addClass("tier" + tier)
                .text(percent + "%");

            });

        });

    },

    ui: {

        buildTimeInput: function() {
            $("#input-feed-time").datetimepicker({
                inline: true,
                format: "LT"
            });
            $("#input-feed-time .timepicker button").removeClass("btn").removeClass("btn-primary");
            $("#input-feed-time .timepicker-picker table.table-condensed tr:first").hide();
            $("#input-feed-time .timepicker-picker table.table-condensed tr:nth-child(3)").hide();
        },

        buildHistoryCalendars: function() {
            $("#input-history-last-month").datetimepicker({
                inline: true,
                date: moment().subtract(1, "months").format("YYYY-MM-DD")
            });
            $("#input-history-current-month").datetimepicker({
                inline: true,
                date: moment().format("YYYY-MM-DD")
            });

            $(".datepicker .picker-switch")
            .attr("colspan", 7)
            .attr("data-action", "");

            $(".datepicker .old").text("");
            $(".datepicker .new").text("");
            $(".datepicker .day")
            .attr("data-action", "")
            .removeClass("active")
            .removeClass("today")
            .removeClass(function (index, className) {
                return (className.match (/(^|\s)tier\S+/g) || []).join(' ');
            })
            .text("");

        },

        updateFeedVolumeLabel: function() {
            $("#label-feed-volume span").html($("#input-feed-volume").val());
        }

    },

    userActions: {

        saveFeed: function(event) {
            event.preventDefault();

            // find the date - if the time if more than 2 hours into the future, use yesterday, allowing for up to 22
            // hours to enter a past feed
            var date = moment().format("YYYY-MM-DD");
            if ((parseInt($("#input-feed-time").datetimepicker("date").format("HH")) - 2) > moment().hours())
                var date = moment().subtract(1, "days").format("YYYY-MM-DD");

            // prepare data to be sent to the server
            date += " " + $("#input-feed-time").datetimepicker("date").format("HH:mm");
            var milliliters = $("#input-feed-volume").val();

            // save the feed
            babyFeeds.server.saveFeed(date, milliliters, function() {

                // rebuild the page with updated data
                babyFeeds.init();

            });

        }

    },

    server: {

        // loads all server data
        // callback(array: All database data)
        load: function(callback) {

            $.ajax({
                type: "GET",
                url: "/api/load",
                contentType: "application/json",
                success: callback
            });

        },

        // saves a feed to the database
        // callback()
        saveFeed: function(dateTime, milliliters, callback) {

            $.ajax({
                type: "POST",
                url: "/api/savefeed",
                data: JSON.stringify({
                    dateTime: dateTime,
                    milliliters: milliliters
                }),
                contentType: "application/json",
                success: callback
            });

        }

    }

};
