module.exports = {
  options: {
    livereload: true
  },
  scripts: {
    files: ['<%= project.dev %>/js/**/*.js'],
    tasks: ['browserify']
  },
  styles: {
    files: ['<%= project.dev %>/css/**/*.scss'],
    tasks: ['postcss'],
    options: {
      spawn: false,
    }
  },
  images: {
    files: ['<%= project.dev %>/images/**/*.{png,jpg,gif}'],
    tasks: ['imagemin']
  },
  html: {
    files: ['<%= project.dev %>/**/*'],
    tasks: ['copy']
  }
};