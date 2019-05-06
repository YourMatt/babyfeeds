var database = require ("./databaseaccessor.js"),
    moment = require("moment");

exports.process = function (req, res) {

    // req.method, req.url
    var endpoint = req.url;
    var method = req.method;
    var processed = false;

    switch (endpoint) {

        case "/api/load":
            if (method === "GET") {
                database.query.getFeedTotalsPerDay(function (feedTotalsPerDay) {
                    feedTotalsPerDay.forEach(function (element) {

                        var goalCaloriesForDay = Math.ceil(element.WeightOuncesOnDay * process.env.KILOGRAMS_PER_OUNCE * element.GoalCaloriesPerKilogramOnDay);
                        var totalCaloriesForDay = Math.ceil(element.AverageRecipeCaloriesPerOunce / process.env.MILLILITERS_PER_OUNCE * element.TotalVolume);

                        element.Percent = Math.round(totalCaloriesForDay / goalCaloriesForDay * 100);

                        // TODO: Calculate daily requirement only for current day, using query of account info
                        element.Required = Math.floor(element.WeightOuncesOnDay * process.env.FEED_MLS_PER_BABY_WEIGHT_OUNCE);

                    });

                    var today = moment().format("YYYY-MM-DD");

                    var lastFeedTime = moment(feedTotalsPerDay[feedTotalsPerDay.length - 1].LastFeedTime).format("h:mma");
                    var actualAge = moment().diff(moment(process.env.BIRTH_DATE), "week");
                    var correctedAge = moment().diff(moment(process.env.EXPECTED_DATE), "week");
                    var weightInOunces = feedTotalsPerDay[feedTotalsPerDay.length - 1].WeightOuncesOnDay;
                    var weight = Math.floor(weightInOunces / 16) + "lbs " + (weightInOunces % 16) + "oz";

                    database.query.getFeedsForDay(today, function (feedsForDay) {

                        res.json({
                            today: today,
                            lastFeedTime: lastFeedTime,
                            feedTotalsPerDay: feedTotalsPerDay,
                            feedsForToday: feedsForDay,
                            feedRequiredForToday: feedTotalsPerDay[feedTotalsPerDay.length-1].Required,
                            weight: weight,
                            actualAge: actualAge,
                            correctedAge: correctedAge
                        });

                    });
                });

                processed = true;
            }
            break;

        case "/api/savefeed":
            if (method === "POST") {

                var dateTime = req.body.dateTime;
                var milliliters = req.body.milliliters;

                database.query.insertFeed(dateTime, milliliters, function() {
                    res.json({});
                });

                processed = true;
            }
            break;

    }

    // exit as not found if nothing processed the request already
    if (!processed)
        res.status(404).end();

};
