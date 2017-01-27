import config from '../config';

var EventEmitter = require('events').EventEmitter;
var AppDispatcher = require('./actions').AppDispatcher;
var TrackerConstants = require('./constants');

var _config = {
    _weekToStartOn: 0
}

var _state = {
    projects: [],
    dates: [],
    people: [],
    clients: [],
    currentDay: '',
    settings: [],
    date: new Date()
}
let _cachedState = {};

// hacky oauth fix
// After about an hour, token expires requiring a reload
// until a better solution is implemented
function reAuth() {
    location.reload();
}

function errorHandler(res, status, error) {
    console.group('AJAX ERROR:');
    console.error('Res: ', res);
    console.error('Status: ', status);
    console.error('Error: ', error);
    console.groupEnd();

    reAuth();
}

function _getSettings() {
    var range = 'B:B';

     $.ajax({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/settings!${range}?access_token=${_config.token}`,
        type: 'GET',
        dataType: 'text',
        success: (res, status) => {
            const { values } = JSON.parse(res);
            let settings = [];

            // Get App Settings
            /*
                Structure
                ----
                0: Logo URL
                1: Company Name
                2: Screen Saver
                3: Screen Saver Image
                4: Screen Saver Frequency
                5: Screen Saver Duration
                6: Show Day of Week Labels
                7: Highlight Day of Week
            */
            values.forEach(setting => {
                settings.push(setting);
            });

            // Set Favicon
            let favicon = document.querySelector('link[rel="shortcut icon"]');

            if (favicon.href != settings[0]) {
                favicon.href = settings[0];
            }

            _state.settings = settings;

            SettingsStore.emitChange();
        },
        error: errorHandler
    });
}

function _getProjects() {
    var range = 'A:A';

     $.ajax({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${config.sheetId}!${range}?access_token=${_config.token}`,
        type: 'GET',
        dataType: 'text',
        success: (res, status) => {
            const { values } = JSON.parse(res);
            let clientsArr = values[0][0].split('|');
            let clientsData = [];
            let clientsList = []
            let reformattedProjectsArray = [];

            // Get Project Info
            values.forEach(project => {
                let projectArr = project[0].split(" ");

                reformattedProjectsArray.push({
                    name: projectArr[0],
                    color: projectArr[1]
                });
            });

            for (var i = 0; i < clientsArr.length; i++) {
                if(clientsArr[i].split('#') != ' ') {
                    clientsData.push(clientsArr[i].split('#'));
                }
            }

            for (let i = 0; i < clientsData.length; i++) {
                clientsList.push({
                    name: clientsData[i][0], 
                    color: '#' + clientsData[i][1]
                });
            }

            _state.clients = clientsList;
            _state.projects = reformattedProjectsArray;
            TrackerStore.emitChange();
        },
        error: errorHandler
    });
}

function _getDates() {
    var range = '';
    var numRows = (config.numberOfUsers * 2) + 1; // 2 Rows per user + 1 for the date row

    // Get all the row data till the end of time
    for (var i = 1; i <= numRows; i++) {
        range += '&ranges=' + config.sheetId + '!' + i + ':' + i;
    }

    $.ajax({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values:batchGet?majorDimension=ROWS${range}&access_token=${_config.token}`,
        type: 'GET',
        dataType: 'text',
        success: function (res, status) {
            const resParsed = JSON.parse(res);
            const today = new Date();
            const dd = (today.getDate() < 10) ? `0${today.getDate()}` : today.getDate();
            const mm = (today.getMonth()+1 < 10) ? `0${today.getMonth()+1}` : today.getMonth()+1;
            const yyyy = today.getFullYear();
            const weekday = new Array(7);
            weekday[0] =  "Sun";
            weekday[1] = "Mon";
            weekday[2] = "Tue";
            weekday[3] = "Wed";
            weekday[4] = "Thu";
            weekday[5] = "Fri";
            weekday[6] = "Sat";
            let reformattedProjectsArray = []; // change name since it's dates, not projects?
            let dateMarkerActive = false;
            let dateMarkerCount = 0;
            let startingWeekTriggered = false;
            let currentWeek = 0; // So that we know which week to start the project listing
            let nameOfDay = weekday[today.getDay()];

            resParsed.valueRanges[0].values[0].forEach(date => {
                if (date.length > 0 && (date.indexOf("/") > -1)) {
                    const currentDate = new Date(); // Current Date
                    const weekDate = new Date(date); // Week from Calendar
                    const timeDiff = Math.abs(weekDate.getTime() - currentDate.getTime());
                    const dateDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    const dateArr = date.split('/');

                    // Need handling for weekends
                    if (dateDiff >= 0 && dateDiff <= 5) {
                        dateMarkerActive = true;
                    }

                    // Only show 6 weeks worth of data
                    if (dateMarkerActive == true && dateMarkerCount < 6) {
                        if (!startingWeekTriggered) {
                            _config._weekToStartOn = currentWeek;
                        }
                        reformattedProjectsArray.push({
                            month: dateArr[0],
                            day: dateArr[1]
                        });
                        dateMarkerCount++;
                        startingWeekTriggered = true;
                    }

                    currentWeek++;
                }
            });

            _state.currentDay = nameOfDay;
            _state.dates = reformattedProjectsArray;
            _parseProjects(resParsed);
        },
        error: errorHandler
    });
}

function _parseProjects(data) {
    var reformattedDataArray = [],
        personName = '',
        personHalfDaySavedArray = [];

    // Skip first Row
    for (var i = 1; i <= data.valueRanges.length - 1; i++) {
        // Every 2 rows = 1 person's full day
        data.valueRanges[i];
        var personHalfDayArray = [],
            multiDayProject = false,
            projectName = '',
            prevProjectName = '', // So that we know which project to assign a delivery to
            weekCount = 0,
            projectLength = 1, // How many days the project should span
            weekToStart = (_config._weekToStartOn * 5) + 2; // Ex: 3 weeks from start, multiply that 3 x 5 (days in a week) and + 2 to skip the first to colums

        // Loop through both parts of a person's day
        // Start at second position to skip project column and merged cell
        for (var d = weekToStart; d <= parseInt(weekToStart + 30); d++) {
            // Check for a project name
            if(data.valueRanges[i].values[0][d].length >= 1) {
                // End current project tracking and start a new one when the next projec tname appears
                //if(data.valueRanges[i].values[0][d] != projectName) {
                    if (projectName.length > 0) {
                        if(projectName.indexOf('-') > -1) {
                            let projectArr = projectName.split('-');

                            var projectColor = _checkProjectColor(projectArr[0]),
                                id = personName + projectArr[0] + projectLength + d;
                            personHalfDayArray.push({name: projectArr[0], duration: projectLength, color: projectColor, id: id, delivery: true});
                        }
                        else {
                            var projectColor = _checkProjectColor(projectName),
                                id = personName + projectName + projectLength + d;
                            personHalfDayArray.push({name: projectName, duration: projectLength, color: projectColor, id: id, });
                            prevProjectName = projectName;
                        }
                    }
                    // If project length is > 5 (length of a week)
                    multiDayProject = true;
                    projectName = data.valueRanges[i].values[0][d];
                    projectLength = 1; // Resets project length to initial start of 1
                //}
            }
            // Add to project duration if the next cell in the spreadsheet is empty
            else if(data.valueRanges[i].values[0][d].length <= 1 && multiDayProject == true) {
                projectLength++;
            }
            
        }

        // Even
        if(i % 2 == 0) {
            // Push both morning and afternoon times
            reformattedDataArray.push({employee: personName, top: personHalfDaySavedArray, bottom: personHalfDayArray});
        }
        // Odd, assign day to person
        else {
            personName = data.valueRanges[i].values[0][1];
            personHalfDaySavedArray = personHalfDayArray;
        }
    }

    _parseProjectsByWeek(reformattedDataArray);
}

// Return project's color
function _checkProjectColor(project) {
    for (var i = 0; i < _state.projects.length; i++) {
       if(_state.projects[i].name == project) {
        return _state.projects[i].color;
       }
    }
}

// Breaks down parsed projects and breaks them down by week for easy rendering
function _parseProjectsByWeek(data) {
    var formattedByWeek = [];

    // Get each person's weekly time breakdown
    for (var i = 0; i < data.length; i++) {
        //data[i]
        var weekMaxDuration = 5,
            currentWeekTimeTop = 0,
            currentWeekTimeBottom = 0,
            fullResourcesTop = [],
            weekResourcesTop = [],
            fullResourcesBottom = [],
            weekResourcesBottom = [],
            fullResources = [];

        for (var d = 0; d < data[i].top.length; d++) {

            if(weekMaxDuration - currentWeekTimeTop - data[i].top[d].duration >= 0) {
                currentWeekTimeTop += data[i].top[d].duration;
                weekResourcesTop.push(data[i].top[d]);
            }
            if(weekMaxDuration - currentWeekTimeTop == 0) {
                //fullResourcesTop.push(weekResourcesTop);
                fullResources.push(weekResourcesTop)
                weekResourcesTop = [];
                currentWeekTimeTop = 0;
            }
        }

        for (var a = 0; a < data[i].bottom.length; a++) {
            if(weekMaxDuration - currentWeekTimeBottom - data[i].bottom[a].duration >= 0) {
                currentWeekTimeBottom += data[i].bottom[a].duration;
                weekResourcesBottom.push(data[i].bottom[a]);
            }
            if(weekMaxDuration - currentWeekTimeBottom == 0) {
                fullResourcesBottom.push(weekResourcesBottom);
                weekResourcesBottom = [];
                currentWeekTimeBottom = 0;
            }
        }

        for (var c = 0; c < fullResources.length; c++) {
            
            if (undefined !== fullResourcesBottom[c] && fullResourcesBottom[c].length) {
                for (var b = 0; b < fullResourcesBottom[c].length; b++) {
                    fullResources[c].push(fullResourcesBottom[c][b]);
                }
            }
        }

        formattedByWeek.push({employee: data[i].employee, weeklyBreakdown: fullResources});
        //formattedByWeek.push({employee: data[i].employee, weeklyBreakdownTop: fullResourcesTop, weeklyBreakdownBottom: fullResourcesBottom});
    }

    _state.people = formattedByWeek;

    DateStore.emitChange();
}

function _checkDiff() {
    const data = ['clients', 'dates', 'people', 'projects', 'settings'];

    for (let i = 0, l = data.length; i < l; i++) {
        if (_state[data[i]] != _cachedState[data[i]]) {
            return true;
        }
    }

    return false;
}

function _generateToken() {
    if (!_config.token) {
        _config.token = gapi.auth.getToken().access_token;
    }
}

function _reloadTracker() {
    _generateToken();
    _getSettings();
    _getProjects();
    _getDates();
    // Reload all the data
}

var SettingsStore = $.extend({}, EventEmitter.prototype, {
    getState: function() {
        return _state;
    },
    emitChange: function() {
        this.emit('change');
    },
    addChangeListener: function(callback) {
        this.on('change', callback);
    },
    removeChangeListener: function(callback) {
        this.removeListener('change', callback);
    }
});

var TrackerStore = $.extend({}, EventEmitter.prototype, {
    getState: function() {
        return _state;
    },
    emitChange: function() {
        this.emit('change');
    },
    addChangeListener: function(callback) {
        this.on('change', callback);
    },
    removeChangeListener: function(callback) {
        this.removeListener('change', callback);
    }
});

var DateStore = $.extend({}, EventEmitter.prototype, {
    getState: function() {
        return _state;
    },
    emitChange: function() {
        this.emit('change');
    },
    addChangeListener: function(callback) {
        this.on('change', callback);
    },
    removeChangeListener: function(callback) {
        this.removeListener('change', callback);
    }
});

AppDispatcher.register(function(action) {
    switch(action.actionType) {
        case TrackerConstants.GET_PROJECTS:
            _getProjects();
            _getDates();
        break;
        case TrackerConstants.GET_DATES:
            _getDates();
        break;
        case TrackerConstants.GET_PEOPLE:
            _getPeople();
        break;
        case TrackerConstants.GET_PEOPLES_DATA:
            _getPeoplesData();
        break;
        case TrackerConstants.GET_SETTINGS:
            _getSettings();
        break;
    }
    return true;
});

module.exports.SettingsStore = SettingsStore;
module.exports.TrackerStore = TrackerStore;
module.exports.DateStore = DateStore;
module.exports.reloadTracker = _reloadTracker;