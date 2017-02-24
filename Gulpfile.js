'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var minify = require('gulp-minify');

gulp.task('styles', function () {
	gulp.src('src/sass/**/*.sass')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./dist/css/'));
});

gulp.task('build-js', function () {
	gulp.src('src/js/**/*.js')
		.pipe(minify())
		.pipe(gulp.dest('dist/js/'));
});

gulp.task('watch', function () {
	gulp.watch('src/sass/**/*.sass', [ 'styles' ]);
	gulp.watch('src/js/**/*.js', [ 'build-js' ]);
});

gulp.task('default', [ 'styles', 'build-js', 'watch' ]);
