module.exports = {
  dynamic: {
    files: [{
      expand: true,
      cwd: '<%= project.dev %>/images/',
      src: ['**/*.{png,jpg,gif}'],
      dest: '<%= project.dist %>/images/'
    }]
  }
};