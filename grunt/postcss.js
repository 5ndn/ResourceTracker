module.exports = {
  options: {
      map: true,
      parser: require('postcss-scss'),
      processors: [
          require('precss')(),
          require('postcss-math')(),
          require('postcss-conditionals')(),
          require('postcss-for')(),
          require('postcss-nth-list'),
          require('css-mqpacker')(),
          require('autoprefixer')({
              browsers: ['last 3 versions']
          })
      ]
  },
  dist: {
      files: [
          {'<%= project.dist %>/css/main.css': '<%= project.dev %>/css/main.scss'}
      ],
  }
}