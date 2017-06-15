var gulp = require('gulp')
var babel = require('gulp-babel')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')

gulp.task('js', function(){
  console.log('gulp js')
  return gulp.src('lib/Zender.js')
    .pipe(gulp.dest('dist'))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(rename(function(path){
      path.basename += '.min'
    }))
    .pipe(gulp.dest('dist'))
})