const mysql = require ("mysql");

exports.query = {

    getBabyInfo: (babyId, callback) => {

        exports.access.selectSingle({
                sql:
                    "SELECT     b.Name " +
                    ",          b.BirthDate " +
                    ",          b.ExpectedDate " +
                    ",          r.RecipeId " +
                    ",          r.Name AS RecipeName " +
                    ",          r.CaloriesPerOunce AS RecipeCaloriesPerOunce " +
                    ", (        SELECT Kilograms FROM Weights WHERE BabyId = b.BabyId ORDER BY Date DESC LIMIT 1) AS WeightKilograms " +
                    ", (        SELECT DATE_FORMAT(MAX(Date), '%Y-%m-%d %H:%i') FROM Feeds WHERE BabyId = b.BabyId) AS LastFeedTime " +
                    ", (        SELECT Calories FROM Feeds WHERE BabyId = b.BabyId ORDER BY Date DESC LIMIT 1) AS LastFeedCalories " +
                    ", (        SELECT MAX(Calories) FROM Feeds WHERE BabyId = b.BabyId) AS MaxFeedCalories " +
                    "FROM       Babies b " +
                    "INNER JOIN Recipes r ON r.RecipeId = b.RecipeId " +
                    "WHERE      BabyId = ? ",
                values: babyId
            },
            callback
        );

    },

    getFeedTotalsPerDay: (babyId, callback) => {

        exports.access.selectMultiple({
                sql:
                    "SELECT     DATE_FORMAT(Date, '%Y-%m-%d') AS Date " +
                    ",          GoalCalories " +
                    ",          TotalCalories " +
                    ",          ROUND(TotalCalories / GoalCalories * 100) AS Percent " +
                    "FROM       DailyTotals " +
                    "WHERE      BabyId = ? " +
                    "ORDER BY   Date ASC ",
                values: [babyId]
            },
            callback
        );

    },

    getRecipes: (accountId, callback) => {

        exports.access.selectMultiple({
                sql:
                    "SELECT     r.* " +
                    ", (        SELECT MAX(Date) FROM Feeds WHERE RecipeId = r.RecipeId) AS LastUsed " +
                    "FROM       Recipes r " +
                    "WHERE      r.AccountId = ? " +
                    "ORDER BY   r.Name ASC ",
                values: accountId
            },
            callback
        );

    },

    getRecipe: (recipeId, callback) => {

        exports.access.selectSingle({
                sql:
                    "SELECT * " +
                    "FROM   Recipes " +
                    "WHERE  RecipeId = ? ",
                values: recipeId
            },
            callback
        );

    },

    getFeed: (feedId, callback) => {

        exports.access.selectSingle({
                sql:
                    "SELECT FeedId " +
                    ",      BabyId " +
                    ",      DATE_FORMAT(Date, '%Y-%m-%d') AS Date " +
                    ",      DATE_FORMAT(Date, '%H:%i') AS Time " +
                    ",      RecipeId " +
                    ",      Calories " +
                    "FROM   Feeds " +
                    "WHERE  FeedId = ? ",
                values: feedId
            },
            callback
        );

    },

    getFeeds: (babyId, oldestDate, callback) => {

        if (!oldestDate) oldestDate = "2018-01-01";

        exports.access.selectMultiple({
                sql:
                    "SELECT    FeedId " +
                    ",         BabyId " +
                    ",         DATE_FORMAT(Date, '%Y-%m-%d') AS Date " +
                    ",         DATE_FORMAT(Date, '%H:%i') AS Time " +
                    ",         RecipeId " +
                    ",         Calories " +
                    "FROM      Feeds " +
                    "WHERE     BabyId = ? " +
                    "AND       Date >= ? " +
                    "ORDER BY  Feeds.Date",
                values: [babyId, oldestDate]
            },
            callback
        );

    },

    getFeedsForDay: (babyId, day, callback) => {

        exports.access.selectMultiple({
                sql:
                    "SELECT    DATE_FORMAT(Date, '%H:%i') AS Time " +
                    ",         Calories " +
                    "FROM      Feeds " +
                    "WHERE     BabyId = ? " +
                    "AND       DATE_FORMAT(Date, '%Y-%m-%d') = ? " +
                    "ORDER BY  Date",
                values: [babyId, day]
            },
            callback
        );

    },

    insertFeed: (babyId, dateTime, calories, recipeId, callback) => {

        exports.access.insert({
                sql:
                    "INSERT INTO Feeds " +
                    "(           BabyId, RecipeId, Date, Calories) " +
                    "VALUES (    ?, ?, ?, ?) ",
                values: [babyId, recipeId, dateTime, calories]
            },
            (numInserted) => {

                // update the running total to include the new feed
                exports.query.refreshDailyTotalsForDay(
                    babyId,
                    dateTime.split(" ")[0],
                    callback
                );

            }
        );

    },

    updateFeed: (feedId, dateTime, calories, recipeId, callback) => {

        exports.query.getFeed(feedId, (feed) => {
                if (!feed.FeedId) return callback(0);

                exports.access.update({
                        sql:
                            "UPDATE Feeds " +
                            "SET    RecipeId = ? " +
                            ",      Date = ? " +
                            ",      Calories = ? " +
                            "WHERE  FeedId = ? ",
                        values: [recipeId, dateTime, calories, feedId]
                    },
                    (numUpdated) => {

                        // update the running total on the original date to exclude the originally recorded feed
                        exports.query.refreshDailyTotalsForDay(
                            feed.BabyId,
                            feed.Date,
                            () => {

                                let newDate = dateTime.split(" ")[0];

                                // return if the date did not change for the feed
                                if (feed.Date === newDate) return callback();

                                // update the running total for the new feed date
                                exports.query.refreshDailyTotalsForDay(
                                    feed.BabyId,
                                    newDate,
                                    callback
                                );

                            }
                        );
                    }
                );
            }
        );

    },

    refreshDailyTotalsForDay: (babyId, date, callback) => {

        // remove any existing daily totals
        exports.access.update({
                sql:
                    "DELETE FROM DailyTotals " +
                    "WHERE       BabyId = ? " +
                    "AND         Date = ? ",
                values: [babyId, date]
            }, (numDeleted) => {

                // calculate the new total for the day
                exports.access.insert({
                        sql:
                            "INSERT INTO DailyTotals " +
                            "(           BabyId, Date, GoalCalories, TotalCalories) " +
                            "SELECT      f.BabyId " +
                            ",           DATE_FORMAT(f.Date, '%Y-%m-%d') AS Date " +
                            ", (         SELECT Kilograms FROM Weights WHERE Date <= DATE_FORMAT(f.Date, '%Y-%m-%d') ORDER BY Date DESC LIMIT 1) * " +
                            "  (         SELECT CaloriesPerKilogram FROM Goals WHERE Date <= DATE_FORMAT(f.Date, '%Y-%m-%d') ORDER BY Date DESC LIMIT 1) AS GoalCaloriesForDay " +
                            ",           SUM(f.Calories) AS TotalCalories " +
                            "FROM        Feeds f " +
                            "INNER JOIN  Recipes r ON r.RecipeId = f.RecipeId " +
                            "WHERE       f.BabyId = ? " +
                            "AND         f.Date >= ? AND f.Date < DATE_ADD(?, INTERVAL 1 DAY) " +
                            "GROUP BY    DATE_FORMAT(f.Date, '%Y-%m-%d') ",
                        values: [babyId, date, date]
                    },
                    callback);

            }
        );

    },

    updateBabyDefaultRecipe: (babyId, recipeId, callback) => {

        exports.access.update({
                sql:
                    "UPDATE Babies " +
                    "SET    RecipeId = ? " +
                    "WHERE  BabyId = ? ",
                values: [recipeId, babyId]
            },
            callback
        );

    }

};

exports.access = {

    db: null,

    init: () => {

        if (exports.access.db) return;

        // create the db connection
        exports.access.db = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // connect to the database
        exports.access.db.connect((error) => {
            if (error) {
                // TODO: write error data to logs
                console.log('Error connecting to Db: ' + error);
                return;
            }
        });

    },

    close: () => {

        return; // TODO: Evaluate if can keep and call with res output

        // close the database connection
        exports.access.db.end(() => {
            exports.access.db = null;
        });

    },

    handleError: (query, error) => {

        // TODO: write error data to logs
        console.log("Error running query: " + error);
        console.log(query);

    },

    selectSingle: (query, callback) => {

        exports.access.selectMultiple(query, callback, true);

    },

    selectMultiple: (query, callback, returnSingle) => {

        exports.access.init();

        // run the query
        exports.access.db.query(query, (error, rows) => {

            // report error and return if error state
            if (error) return exports.access.handleError(query, error);
            exports.access.close();

            // call the callback with data
            if (returnSingle) callback(rows[0]);
            else callback(rows);

        });

    },

    insert: (query, callback) => {

        exports.access.init();

        exports.access.db.query(query, (error, results) => {

            if (error) return exports.access.handleError(query, error);
            exports.access.close();

            // call the callback with the insert ID
            callback(results.insertId);

        });

    },

    update: (query, callback) => {

        exports.access.init();

        exports.access.db.query(query, (error, results) => {

            if (error) return exports.access.handleError(query, error);
            exports.access.close();

            // call the callback with number of affected records
            callback(results.affectedRows);

        });

    }

};
