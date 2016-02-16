// Load Gulp
var args    = require('get-gulp-args')(),
    concat  = require('gulp-concat'),
    config  = require('./package.json'),
    del     = require('del'),
    gulp    = require('gulp'),
    gutil   = require('gulp-util'),
    nodemon = require('gulp-nodemon'),
    plugins = require('gulp-load-plugins')(),
    rename  = require('gulp-rename');

/* DEV MUST SET PATHS TO LOCAL DIRECTORIES */
var dev_root = '/Users/cecilecruz/dev/[PROJECTDIR]';
var node_modules_dir = dev_root + '/node_modules';

var paths = {
    'css' : {
        'shared_less_dir'   : dev_root + '/dev/less',
        'shared_css_dir'    : dev_root + '/public/css',
    },
    'js'  : {
        'shared_js_src_dir' : dev_root + '/public/js',
        'shared_js_dir'     : dev_root + '/public/js'
    }
};

var browser_prefixes = {
    browsers: [
        '> 1%',
        'last 2 versions',
        'firefox >= 4',
        'safari 7',
        'safari 8',
        'IE 8',
        'IE 9',
        'IE 10',
        'IE 11'
    ],
    cascade: false
};

var common_css_files = [paths.css.shared_css_dir + '/main.css'];

gulp.task('set-project-paths',function(){
    paths.css.project_less_dir    = dev_root + '/dev/'    + args.project + '/less';
    paths.css.project_dev_css_dir = dev_root + '/dev/'    + args.project + '/css';
    paths.css.project_css_dir     = dev_root + '/public/' + args.project + '/css';
    return paths;
});
/* END SET PATHS */
/* JS TASKS */
/* CLEAR EXISTING *.min.js files */
gulp.task('clean-min-js',function(){
  return del([paths.js.shared_js_dir + '/*.min.js'],{force:true});
});
/* MINIFY and rename all js to *.min.js
   run gulp build-js
*/
gulp.task('build-js', ['clean-min-js'],function(){
  return gulp.src(paths.js.shared_js_src_dir + '/*.js')
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.uglify())
    .pipe(plugins.concat('scripts.min.js'))
    .pipe(gulp.dest(paths.js.shared_js_dir));
});

/***************************************
 MINIFY and rename all other css to *.min.css
 run gulp min-css
**************************************/
gulp.task('min-css', ['clean-min-css'],function(){
    return gulp.src(['!' + paths.css.shared_css_dir + '/common.css', '!' + paths.css.shared_css_dir + '/main.css', '!' + paths.css.shared_css_dir + '/normalize.css', paths.css.shared_css_dir + '/**/*.css'])
        .pipe(plugins.plumber())
        .on('error', function (err) {
            gutil.log(err);
            this.emit('ending');
        })
        .pipe(plugins.autoprefixer(browser_prefixes))
        .pipe(plugins.cssmin())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(paths.css.shared_css_dir)).on('error', gutil.log)
        .pipe(plugins.notify({ message: 'minified CSS'}));
});


/* CONCAT common_css_files and MINIFY */
/* CLEAR EXISTING *.min.css files */
gulp.task('clean-min-css',function(){
  return del([paths.css.shared_css_dir + '/**/*.min.css*'],{force:true});
});

gulp.task('min-common-css', ['clean-min-css'], function(){
    return gulp.src(common_css_files)
        .pipe(plugins.plumber())
        .on('error', function (err) {
            gutil.log(err);
            this.emit('end');
        })
        .pipe(plugins.autoprefixer(browser_prefixes))
        .pipe(concat('common.css'))
        .pipe(plugins.cssmin())
        .pipe(gulp.dest(paths.css.shared_css_dir)).on('error', gutil.log)
        .pipe(plugins.notify({ message: 'minified common CSS'}));
});

/* GETS LATEST VERSION OF NORMALIZE.css and copies to shared css dir
** It is recommended that normalize.css file is included as untouched library code so it is excluded from minification (not included in common_css_files)
*/
gulp.task('copy-normalize-css', function(){
    return gulp.src(node_modules_dir + '/normalize.css/*.css')
    .pipe(gulp.dest(paths.css.shared_css_dir)).on('error', gutil.log);
});

// MAIN SCRIPT TO MINIFY AND CONCATENATE COMMON CSS FILES (CSS FILES SHARED ACROSS projects)
gulp.task('min-concat-common-css', ['copy-normalize-css', 'min-common-css'], function(){
    return gulp.src([paths.css.shared_css_dir + '/normalize.css', paths.css.shared_css_dir + '/common.css'])
        .pipe(plugins.plumber())
        .on('error', function (err) {
            gutil.log(err);
            this.emit('end');
        })
        .pipe(plugins.autoprefixer(browser_prefixes))
        .pipe(concat('common.css'))
        .pipe(rename({ extname: '_' + config.version + '.min.css' }))
        .pipe(gulp.dest(paths.css.shared_css_dir)).on('error', gutil.log)
        .pipe(plugins.notify({ message: 'minified common CSS'}));
});


/**************************************
 compile project-specific LESS files to minified CSS:  run gulp build-css --project PROJECT NAME (valid project name is currently case-sensitive)
 // TODO: add common less files
**************************************/
gulp.task('clean-project-min-css',function(){
  return del([paths.css.project_css_dir + '/**/*.min.css*'],{force:true});
});

gulp.task('min-project-css', ['clean-project-min-css'], function(){
    return gulp.src(['!' + paths.css.project_css_dir + '/base.css', paths.css.project_dev_css_dir + '/**/*.css'])
        .pipe(plugins.plumber())
        .on('error', function (err) {
            gutil.log(err);
            this.emit('ending');
        })
        .pipe(plugins.autoprefixer(browser_prefixes))
        .pipe(plugins.cssmin())
        .pipe(rename({ extname: '_' + config.version + '.min.css' }))
        .pipe(gulp.dest(paths.css.project_css_dir)).on('error', gutil.log)
        .pipe(plugins.notify({ message: 'minified project CSS'}));
});

gulp.task('build-project-css',['set-project-paths', 'min-project-css'], function(){
    return gulp.src(paths.css.project_less_dir + '/*.less')
        .pipe(plugins.plumber())
        .pipe(plugins.less())
        .on('error', function (err) {
            gutil.log(err);
            this.emit('end');
        })
        .pipe(plugins.autoprefixer(browser_prefixes))
        .pipe(plugins.cssmin())
        .pipe(gulp.dest(paths.css.project_css_dir)).on('error', gutil.log)
        .pipe(plugins.notify({ message: 'CSS for ' + args.project }));
});

// monitor for changes
gulp.task('watch', function() {
    gulp.watch(paths.js.shared_js_src_dir, ['build-js']);
    gulp.watch(paths.css.shared_css_dir       + '/**/*.css',  ['min-concat-common-css']);
    gulp.watch(paths.css.project_dev_css_dir  + '/**/*.css',  ['min-project-css']);
    gulp.watch(paths.css.project_less_dir     + '/**/*.less', ['build-project-css']);
});

// run gulp --project PROJECTNAME
gulp.task('startnode', ['build-project-css','min-concat-common-css','min-css', 'build-js']);
