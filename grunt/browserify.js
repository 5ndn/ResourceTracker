module.exports = {
  dev: {
    options: {
      transform: [
        ['babelify', {
          presets: ['es2015', 'react', 'stage-0'],
          plugins: ['add-module-exports', 'transform-es2015-modules-commonjs', 'transform-react-jsx']
        }]
      ]
    },
    files: {
      '<%= project.dist %>/js/main.js': ['<%= project.dev %>/js/main.js']
    }
  }
};