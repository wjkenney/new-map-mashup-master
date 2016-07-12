/*
 After you have changed the settings at "Your code goes here",
 run this with one of these options:
  "grunt" alone creates a new, completed images directory
  "grunt clean" removes the images directory
  "grunt responsive_images" re-processes images without removing the old ones
*/


module.exports = function(grunt) {

  grunt.initConfig({

    jshint: {
      options: {
      "eqeqeq" : true
    },
      all: [
        'Gruntfile.js',
        "js/*.js",
        'css/*css',
        'index.html'
      ]
  },
    
    uglify: {
        my_target:{

        files: [{
          expand: true,
          src: ['*.js'],
          cwd: 'js',
          ext: '.min.js',
          dest: 'js/build/'
       
      }]
      
    }
  },
  cssmin: {
    my_target: {
      files:[{
          expand: true,
          src: ['*.css'],
          cwd: 'css',
          ext: '.min.css',
          dest: 'css/build/'
      }]
    }
  },

    htmlmin: {
      my_target: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true, 
          src:['index.html'],
          ext: '.min.html'
        }]
      }
    },
      

    inlinecss: {
      main: {
      files: {
        'index.html': 'index_source.html'
      }
    }
  },

    /* Clear out the images directory if it exists */
    clean: {
      dev: {
        src: ['images', 'js/build'],
      },
    },

    /* Generate the images directory if it is missing */
    mkdir: {
      dev: {
        options: {
          create: ['images']
        },
      },
    },

    /* Copy the "fixed" images that don't go through processing into the images/directory */
    copy: {
      dev: {
        files: [{
          expand: true,
          src: 'images_src/fixed/*.{gif,jpg,png}',
          dest: 'images/'
        }]
      },
    },


  });
  
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-inline-css');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mkdir');
  //these are the default tasks, you need to change these if you want to add or subtract tasks
  grunt.registerTask('default', ['jshint', 'clean', 'uglify', 'cssmin', 'inlinecss', 'htmlmin', 'mkdir', 'copy']);

};
