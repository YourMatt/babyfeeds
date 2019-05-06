var mysql = require ("mysql");

exports.query = {

    getFeedTotalsPerDay: function(callback) {

        exports.access.selectMultiple ({
                sql:
                "SELECT     DATE_FORMAT(f.Date, '%Y-%m-%d') AS Date " +
                ",          SUM(f.Milliliters) AS TotalVolume " +
                ", (        SELECT Ounces FROM Weights WHERE Date <= DATE_FORMAT(f.Date, '%Y-%m-%d') ORDER BY Date DESC LIMIT 1) AS WeightOuncesOnDay " +
                ", (        SELECT CaloriesPerKilogram FROM Goals WHERE Date <= DATE_FORMAT(f.Date, '%Y-%m-%d') ORDER BY Date DESC LIMIT 1) AS GoalCaloriesPerKilogramOnDay " +
                ",          DATE_FORMAT(MAX(f.Date), '%Y-%m-%d %H:%i') AS LastFeedTime " +
                ",          AVG(r.CaloriesPerOunce) AS AverageRecipeCaloriesPerOunce " +
                "FROM       Feeds f " +
                "INNER JOIN Recipes r ON r.RecipeId = f.RecipeId " +
                "GROUP BY   DATE_FORMAT(f.Date, '%Y-%m-%d')"
            },
            callback);

    },

    getFeedsForDay: function(day, callback) {

        exports.access.selectMultiple ({
                sql:
                "SELECT    DATE_FORMAT(Date, '%H:%i') AS Time " +
                ",         Milliliters " +
                "FROM      Feeds " +
                "WHERE     DATE_FORMAT(Date, '%Y-%m-%d') = ? " +
                "ORDER BY  Date",
                values: day
            },
            callback);

    },

    insertFeed: function(dateTime, milliliters, callback) {

        exports.access.insert({
            sql:
            "INSERT INTO Feeds " +
            "(           BabyId, RecipeId, Date, Milliliters) " +
            "VALUES (    ?, ?, ?, ?)",
            values: [1, 2, dateTime, milliliters]
            },
            callback);

    }

};

exports.access = {

    db: null,

    init: function () {

        // create the db connection
        this.db = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // connect to the database
        this.db.connect(function (error) {
            if (error) {
                // TODO: write error data to logs
                console.log('Error connecting to Db: ' + error);
                return;
            }
        });

    },

    close: function () {

        // close the database connection
        this.db.end();

    },

    handleError: function (query, error) {

        // TODO: write error data to logs
        console.log("Error running query: " + error);
        console.log(query);

    },

    selectSingle: function (query, callback) {

        this.selectMultiple(query, callback, true);

    },

    selectMultiple: function (query, callback, returnSingle) {

        this.init();

        // run the query
        this.db.query(query, function (error, rows) {

            // report error and return if error state
            if (error) return exports.access.handleError(query, error);

            // call the callback with data
            if (returnSingle) callback(rows[0]);
            else callback(rows);

        });

        this.close();

    },

    insert: function (query, callback) {

        this.init();

        this.db.query(query, function (error, results) {

            if (error) return exports.access.handleError(query, error);

            // call the callback with the insert ID
            callback(results.insertId);

        });

    }

};