module.exports = {
  dist: {
    files: [{
      dot: true,
      src: [
        '<%= project.dist %>',
        '!<%= project.dist %>/.git*'
      ]
    }]
  }
};