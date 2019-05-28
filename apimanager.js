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
                database.query.getBabyInfo(
                    process.env.SELECTED_BABY,
                    function(babyData) {

                        database.query.getFeedTotalsPerDay(function (feedTotalsPerDay) {

                            var goalCaloriesForDay = 0;
                            var totalCaloriesForDay = 0;
                            feedTotalsPerDay.forEach(function (element) {
                                goalCaloriesForDay = Math.ceil(element.WeightOuncesOnDay * process.env.KILOGRAMS_PER_OUNCE * element.GoalCaloriesPerKilogramOnDay);
                                totalCaloriesForDay = Math.ceil(element.AverageRecipeCaloriesPerOunce / process.env.MILLILITERS_PER_OUNCE * element.TotalVolume);
                                element.Percent = Math.round(totalCaloriesForDay / goalCaloriesForDay * 100);
                            });

                            var today = moment().format("YYYY-MM-DD");
                            var actualAge = moment().diff(moment(babyData.BirthDate), "week");
                            var correctedAge = moment().diff(moment(babyData.ExpectedDate), "week");
                            var weightInOunces = feedTotalsPerDay[feedTotalsPerDay.length - 1].WeightOuncesOnDay;
                            var weight = Math.floor(weightInOunces / 16) + "lbs " + (weightInOunces % 16) + "oz";
                            var goalVolume = Math.round(goalCaloriesForDay / (babyData.RecipeCaloriesPerOunce / process.env.MILLILITERS_PER_OUNCE));

                            database.query.getFeedsForDay(today, function (feedsForDay) {

                                res.json({

                                    // new values after react rewrite
                                    dateToday: today,
                                    dateBirth: moment(babyData.BirthDate).format("YYYY-MM-DD"),
                                    dateExpected: (babyData.ExpectedDate) ? (moment(babyData.ExpectedDate).format("YYYY-MM-DD")) : "",
                                    lastFeedTime: moment(babyData.LastFeedTime).format("h:mma"),
                                    lastFeedVolume: babyData.LastFeedVolume,
                                    maxFeedVolume: babyData.MaxFeedVolume,
                                    weightOunces: weightInOunces,

                                    // original values
                                    today: today,
                                    feedTotalsPerDay: feedTotalsPerDay,
                                    feedsForToday: feedsForDay,
                                    feedRequiredForToday: goalVolume,
                                    weight: weight,
                                    actualAge: actualAge,
                                    correctedAge: correctedAge

                                });

                            });
                        });
                    }
                );

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
