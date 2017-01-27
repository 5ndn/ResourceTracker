module.exports = {
  html: {
      expand: true,
      cwd: '<%= project.dev %>',
      src: ['index.html'],
      dest: '<%= project.dist %>'
  }
}