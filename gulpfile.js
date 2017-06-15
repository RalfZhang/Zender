var babel = require('gulp-babel')
var rename = require('gulp-rename')


gulp.task('js', function(){
  console.log('gulp js')
  return gulp.src('lib/Zender.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    // .pipe(rename(function(path){
    //   path.basename += '.min'
    // }))
    .pipe(gulp.dest('dist'))
})