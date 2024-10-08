var gulp = require('gulp');
var gutile = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var notifier = require('node-notifier');
var server = require('gulp-server-livereload');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var watch = require('gulp-watch');

//format errors

var notify = function(error){
    var message = "In: ";
    var title = "Error: ";

    if(error.description){
        title += error.description;
    }else if(error.message){
        title += error.message;
    }
    if(error.filename){
        var file = error.filename.split('/');
        message += file[file.lenght-1];
    }
    if (error.lineNumber) {
        message += '\nOn Line: ' + error.lineNumber;
    }

    notifier.notify({title: title, message: message});

};

//Bundle sittings

var bundler = watchify(browserify({
    entries: ["./src/app.jsx"],
    transform: [reactify],
    extensions: ['.jsx'],
    debug: true,
    cache:{},
    packageCache: {},
    fullPaths: true
}));

//Bundle tasks

function bundle(){
    return bundler
        .bundle()
        .on('error', notify)
        .pipe(source('main.js'))
        .pipe(gulp.dest('./'))
}

bundler.on('update', bundle);

//Create bundle

gulp.task('build', function(){
    bundle();
})

//Compile the SASS files from main.css
gulp.task('sass', function(){
    gulp.src('./sass/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('styles.css'))
        .pipe(gulp.dest('./'));
});

//live reload server settings

gulp.task('serve', function(done){
    gulp.src('')
        .pipe(server({
            livereload: {
            enable: true,
            filter: function(filePath, cb){
                if('/main.js/'.test(filePath)){
                    cb(true)
                }else if('styles.css'.test(filePath)){
                    cb(true)
                }
            }
        },
        open: true
        }));
        
});

//Watch for changes in the SASS files

gulp.task('watch', function(){
    gulp.watch('./sass/**/*.scss/', ['sass']);
});

gulp.task('default', gulp.series('build', 'serve', 'sass', 'watch'));
