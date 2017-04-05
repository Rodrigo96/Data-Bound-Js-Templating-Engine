'use strict';

// modules
const gulp = require('gulp'),
      less = require('gulp-less'),
      rename = require("gulp-rename"),
      eslint = require('gulp-eslint'),
      uglify = require('gulp-uglify'),
      cmq = require('gulp-combine-mq'),
      csslint = require('gulp-csslint'),
      imagemin = require('gulp-imagemin'),
      lesshint = require('gulp-lesshint'),
      cleancss = require('gulp-clean-css'),
      autoprefixer = require('gulp-autoprefixer'),
      browserSync = require('browser-sync').create();

// paths
const cfg = {
  root: 'src',
  build: 'dist',
  src: {
    css: '/css',
    less: '/less',
    js: '/js',
    libs: '/libs',
    imgs: '/imgs'
  },
  dist: {
    css: '/css',
    js: '/js',
    libs: '/libs',
    imgs: '/imgs'
  }
};

gulp.task('lint-less', () => {
  return gulp.src([
      cfg.root + cfg.src.css + cfg.src.less + '/*.less',
      '!' + cfg.root + cfg.src.css + cfg.src.less + '/normalize.less'])
    .pipe(lesshint('.lesshintrc'))
    .pipe(lesshint.reporter())
    .pipe(lesshint.failOnError());
});

gulp.task('compile-less', ['lint-less'],() => {
  return gulp.src(cfg.root + cfg.src.css + cfg.src.less + '/imports.less')
    .pipe(less())
    .pipe(rename("main.css"))
    .pipe(gulp.dest(cfg.root + cfg.src.css));
});

gulp.task('prefix-css', ['cmq'], () => {
  return gulp.src(cfg.root + cfg.src.css + '/main.css')
    .pipe(autoprefixer(
      { browsers: ['last 2 versions'] }
    ))
    .pipe(gulp.dest(cfg.root + cfg.src.css));
});

gulp.task('cmq', ['compile-less'], () => {
  return gulp.src(cfg.root + cfg.src.css + '/main.css')
    .pipe(
      cmq(
        { beautify: true }))
    .pipe(gulp.dest(cfg.root + cfg.src.css));
})

gulp.task('lint-js', () => {
  return gulp.src(cfg.root + cfg.src.js + '/main.js')
    .pipe(eslint('config.json'))
    .pipe(eslint.format())
    // if you want lint to exit with error use this
    .pipe(eslint.failAfterError());
});

gulp.task('watch', ['create-server'], () => {
  gulp.watch([
    cfg.root + cfg.src.css + cfg.src.less + '/*.less',
    cfg.root + cfg.src.js + '/main.js',
    cfg.root + '/*.html'
    ], ['css', 'js', 'reload']);
})

gulp.task('create-server', () => {
  browserSync.init({
        server: {
          baseDir: cfg.root + '/',
        }
      });
});

gulp.task('reload', ['css', 'js'], () => {
  browserSync.reload();
});

gulp.task('copy-html', () => {
  return gulp.src(cfg.root + '/*.html')
    .pipe(gulp.dest(cfg.build + '/'));
})

gulp.task('copy-libs', () => {
  return gulp.src(cfg.root + '/' + cfg.src.js + cfg.src.libs + '/*.js')
    .pipe(gulp.dest(cfg.build + '/' + cfg.dist.js + cfg.dist.libs));
})

gulp.task('minify-js', () => {
  return gulp.src(cfg.root + cfg.src.js + '/main.js')
    .pipe(uglify())
    .pipe(gulp.dest(cfg.build + '/' + cfg.dist.js));
});

gulp.task('minify-css', () => {
  return gulp.src(cfg.root + cfg.src.css + '/main.css')
    .pipe(cleancss({debug: true}, details => {
            console.log('Normal ' + details.name + ': ' + details.stats.originalSize + ' bytes');
            console.log('Minified ' + details.name + ': ' + details.stats.minifiedSize + ' bytes');
        }))
    .pipe(gulp.dest(cfg.build + '/' + cfg.dist.css));
});

gulp.task('minify-imgs', () => {
  return gulp.src(cfg.root + cfg.src.imgs + '/*.*')
    .pipe(imagemin())
    .pipe(gulp.dest(cfg.build + '/' + cfg.dist.imgs));
})

// tasks
gulp.task('default', ['css', 'js']);
gulp.task('js', ['lint-js']);
gulp.task('css', ['lint-less', 'compile-less', 'cmq', 'prefix-css']);
gulp.task('server', ['create-server', 'watch'])
gulp.task('dist', ['copy-html', 'copy-libs', 'minify-js', 'minify-css', 'minify-imgs']);