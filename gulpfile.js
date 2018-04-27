var gulp        = require('gulp'),
	browserSync = require('browser-sync').create(),
	sass        = require('gulp-sass'),
	jade 		= require('gulp-jade'),
	browserify 	= require('gulp-browserify'),
	uglify 		= require('gulp-uglify'),
	concat 		= require('gulp-concat'),
	gnf 		= require('gulp-npm-files'),
	through = require('through2');


gulp.task('build-views', ['templates','reload']);

gulp.task('templates', function() {
	gulp.src('./master/views/**/*.jade')
	.pipe(jade({
		client: true
	}))
	.pipe(gulp.dest('./app/views/'));
});

gulp.task('reload', function(done){
	browserSync.reload();
	done();
});

gulp.task('base', function() {
	gulp
	.src(gnf(null, './package.json'), {base:'./'})
	.pipe(through.obj(function(file, enc, cb){
		if(file.path.indexOf('.min.js') !== -1 && file.path.indexOf('.min.js.') === -1)
			cb(null, file);
		else
			cb(false)
	}))
	.pipe(concat('base.js'))
	.pipe(gulp.dest('./app/js'));
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('style',function() {
    return gulp.src("./master/sass/*.scss")
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest("app/css/"))
        .pipe(browserSync.stream());
});

// create a task that ensures the `js` task is complete before
// reloading browsers
gulp.task('js-watch', ['js','reload']);


// process JS files and return the stream.
gulp.task('js', function () {
    return gulp.src('./master/js/**/*.js')
        .pipe(browserify())
        .pipe(uglify())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('app/js/'));
});


// Static server
gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: "./app/"
        }
    });
    gulp.start('watch');
});

gulp.task('watch', function(){
    gulp.watch("master/scss/*.scss", ['style']);
    gulp.watch("master/js/*.js", ['js-watch']);
    //gulp.watch("master/views/**/*.jade").on('change',['build-views']);
});

gulp.task('serve', ['style', 'base', 'js', 'templates', 'server']);



gulp.task('default', []);
