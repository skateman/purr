'use strict';

const gulp = require('gulp');
const fs = require('fs');

const clean = require('gulp-clean');
const eslint = require('gulp-eslint');
const json = require('gulp-json-editor');
const rename = require('gulp-rename');
const resize = require('gulp-image-resize');
const tasks = require('gulp-task-listing');
const karma = require('karma');
const zip = require('gulp-zip');

const icons = (platform, main, page) => {
  const generate = (set) => set.reduce((obj, size) => {
    obj[`${size}`] = `img/icon-${size}.png`;
    return obj;
  }, {});

  main.concat(page).forEach((size) => gulp.src('src/icon.png')
    .pipe(resize({ width: size, height: size }))
    .pipe(rename(`icon-${size}.png`))
    .pipe(gulp.dest(`tmp/${platform}/img`))
  );

  return json((data) => {
    data.icons = generate(main);
    data.page_action.default_icon = generate(page);
    return data;
  });
};

gulp.task('help', tasks);
gulp.task('default', gulp.series('help'));
gulp.task('lint', () =>
  gulp.src('src/*.js').pipe(eslint()).pipe(eslint.format())
);

gulp.task('clean', () => gulp.src(['tmp', 'dist'], { read: false }).pipe(clean()));
gulp.task('watch', () => gulp.watch(['src/*.js', 'test/*.js'], ['test', 'build']));

gulp.task('test', (done) => {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('build:firefox', () => {
  gulp.src('src/manifest.json')
    .pipe(icons('firefox', [48, 96], [19, 38]))
    .pipe(gulp.dest('tmp/firefox'));

  gulp.src('src/*.js')
    .pipe(gulp.dest('tmp/firefox/js'));
});

gulp.task('build:chrome', () => {
  gulp.src('src/manifest.json')
    .pipe(json((data) => {
      delete(data.applications);
      return data;
    }))
    .pipe(icons('chrome', [16, 32, 48, 128], [16, 24, 32]))
    .pipe(gulp.dest('tmp/chrome'));

  gulp.src('src/*.js')
    .pipe(gulp.dest('tmp/chrome/js'));
});

['chrome', 'firefox'].forEach((browser) => {
  gulp.task(`pack:${browser}`, gulp.series(`build:${browser}`), () => {
    var files = [`tmp/${browser}/**`];
    if (browser == 'chrome' && fs.existsSync('key.pem')) {
      files.push('key.pem');
    }
    gulp.src(files).pipe(zip(`purr-${browser}.zip`)).pipe(gulp.dest('dist/'));
  });
});

gulp.task('build', gulp.series('lint', gulp.parallel('build:firefox', 'build:chrome')));
gulp.task('pack', gulp.parallel('pack:chrome', 'pack:firefox'));
