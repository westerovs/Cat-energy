"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require('gulp-csso');
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");


gulp.task("css", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
  ]))
  .pipe(csso())
  .pipe(rename("style.css"))
  .pipe(sourcemap.write("."))
  .pipe(gulp.dest("build/css"));
});

// оптимизация картинок
gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
   .pipe(imagemin([
     imagemin.optipng({optimizationLevel: 1}),
     imagemin.jpegtran({progressive: true}),
     imagemin.svgo()
   ]))
    .pipe(gulp.dest("source/img"));
});

// конвертирует в webp
gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
});

// делает спрайты
gulp.task("sprite", function () {
  return gulp.src("source/img/icon-*.svg")
    .pipe(svgstore({
    inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

/* тэг инклюд - он вставляет спрайт
<div style="display:none">
  <include src="source/img/sprite.svg"></include>
</div> */
gulp.task("html", function () {
  return gulp.src("source/*.html")
  .pipe(posthtml([
    include()]))
  .pipe(gulp.dest("build"));
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/css/normalize.css",
    "source/*.ico"
  ], {
    base: "source"
   })
  .pipe(gulp.dest("build"));
});

//Очищаем папку build перед копированием
gulp.task("clean", function () {
 return del("build");
});

// ***
// обновление в браузере
gulp.task("server", function () {
  server.init({
  server: "build/"
  });

  gulp.watch("source/less/**/*.less", gulp.series("css"));
  gulp.watch("source/img/icon-*.svg", gulp.series("sprite", "html", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
  gulp.watch("source/less/blocks/*.less", gulp.series("html", "refresh"));
  });

gulp.task("refresh", function (done) {
  server.reload();
  done();
});


// build - запускает ПОСЛЕДОВАТЕЛЬНО другие задачи
// сперва css и тд
gulp.task("build", gulp.series(
 "clean",
 "copy",
 "css",
 "sprite",
 "html"
));

/*
запуская npm start:
> запустим gulp start
> который запустит build
> который запустит "css", "sprite", "html"
> и в конце gulp server

т.е npm start - автомат. соберётся
css, sprite, этот спрайт будет вставлен в html
и после этого запустится лок.сервер
*/
gulp.task("start", gulp.series("build", "server"));
