var gulp  = require('gulp');
var ect  = require('gulp-ect');
var concat = require('gulp-concat');
var watch  = require('gulp-watch');
var connect = require('gulp-connect');
var webpack = require('webpack-stream');
var webpack2 = require('webpack');
var browserify = require('gulp-browserify');
gulp.task('ect', function(){
    gulp.src(['src/layouts/templates/*.html'])
      .pipe(concat('alltmp.html'))
      .pipe(gulp.dest('src/layouts'));
      gulp.src(['src/index.html'])
        .pipe(ect({
            ext: '.html',
            data: function (filename, cb) {
                cb();
            }
        }))
        .pipe(gulp.dest('build'))
        .pipe(connect.reload());

});
gulp.task('commonJS', function(){
    // webpack( require('./webpack.config.js'),webpack2 ).pipe(gulp.dest('build/js'));
});
gulp.task('js', function(){
    gulp.src('src/js/index.js')
        .pipe(browserify({standalone: 'dsxs'}))
        .pipe(gulp.dest('./build/js'))
        .pipe(connect.reload());

});
gulp.task('deploy', function(){
    gulp.src('build/*.html').pipe(gulp.dest('./public'));
    gulp.src('build/js/*.js').pipe(gulp.dest('./public/js'))
    .pipe(connect.reload());
    // webpack( require('./webpack.config.js'),webpack2 ).pipe(gulp.dest('build/js'));
});
// gulp.task('css', function(){
//
// });
gulp.task('watch', function(){
    gulp.watch('src/**/*.html', function(event) {
        gulp.run('ect');
        gulp.run('deploy');
    });
    gulp.watch(['src/js/**/*.js'], function(event) {
        gulp.run('js');
        gulp.run('deploy');
    });
});
gulp.task('connect', function() {
  connect.server({
    root: './',
    livereload: true
  });
});
gulp.task('default', ['ect','connect','js'],function(){
    gulp.run('watch');
});
