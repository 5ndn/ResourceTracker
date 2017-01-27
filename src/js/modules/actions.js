const TrackerConstants = require('./constants')
const Dispatcher = require('flux').Dispatcher;
const AppDispatcher = new Dispatcher();

// USe waitFor here for dependencies in the dispatcher
const TrackerActions = {
    reload: function() {
        AppDispatcher.dispatch({
            actionType: TrackerConstants.GET_PROJECTS
        });
    },
    reload_dates: function() {
        AppDispatcher.dispatch({
            actionType: TrackerConstants.GET_DATES
        });
    },
    reload_people: function() {
        AppDispatcher.dispatch({
            actionType: TrackerConstants.GET_PEOPLE
        });
    },
    reload_settings: function() {
        AppDispatcher.dispatch({
            actionType: TrackerConstants.GET_SETTINGS
        });
    }
};

module.exports.TrackerActions = TrackerActions;
module.exports.AppDispatcher = AppDispatcher;