import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import config from './config.json';
import {
  stream as wiredep
}

from 'wiredep';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
  return gulp.src(config.dirs.styles + '*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 1 version']
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(config.dirs.build))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('kss', () => {
  gulp.src(['src/**/*.scss'])
    .pipe($.kss({
      overview: config.dirs.styles + 'styleguide.md',
      templateDirectory: config.dirs.kssTpl
    }))

  .pipe(gulp.dest(config.dirs.styleguide))
});

gulp.task('replaceTpl', () => {
  return gulp.src([config.dirs.kssTpl + 'index.html'])
    .pipe($.replace('kss-node Styleguide', config.title))
    .pipe($.replace('public/style.css', 'application.css'))
    .pipe(gulp.dest(config.dirs.kssTpl));
});

gulp.task('serve', ['styles', 'kss'], () => {
  browserSync({
    notify: false,
    port: 9000,
    timestamps: false,
    server: {
      baseDir: [config.dirs.styleguide, config.dirs.build + 'src']
    }
  });

  gulp.watch(config.dirs.styles + '**/*.scss', ['styles', 'kss']);
  gulp.watch(config.dirs.styleguide + '*.html').on('change', reload);

});

gulp.task('build', ['replaceTpl', 'styles', 'kss'], () => {
  return gulp.src(config.dirs.build + '**/*').pipe($.size({
    title: 'build',
    gzip: true
  }));
});

gulp.task('clean', del.bind(null, [config.dirs.build, config.dirs.styleguide]));

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
