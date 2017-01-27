/*
 * PROJECT: FD-Tracker - v0.0.1
 *          http://fiveanddone.com
 *
 */
'use strict';

module.exports = function(grunt) {
    const projectConfig = {
        dev: 'src',
        dist: 'dist'
    };

    require('time-grunt')(grunt);
    require('load-grunt-config')(grunt, {
        data: {
            project: projectConfig,
            pkg: grunt.file.readJSON('package.json'),
            banner: ['/*\n',
                      '  <%= pkg.name %> - <%= pkg.version %>\n',
                      '  <%= grunt.template.today("yyyy-mm-dd") %>\n',
                    '*/\n'].join('')
        }
    });

    grunt.registerTask('default', ['clean', 'postcss', 'browserify', 'copy', 'imagemin', 'notify']);
};
