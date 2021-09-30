const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const del = require('del');
const fs = require( 'fs' )
const path = require('path') 
const data = {} 

gulp.task('json', async function() {
    try { 
        const modules = fs.readdirSync('src/data/') 

        modules.forEach(json => { 
                const module = path.join('src/data', json)
                const name = path.basename( json, path.extname( json ) ) 
                const file = path.join( './src/data', json ) 
                return data[name] = JSON.parse( fs.readFileSync( file ) ) 
            }) 
    } catch (e) { 
        console.log(e)
    } 
})

gulp.task('pug', function() {
	return gulp.src('./src/pug/page/**/*.pug')
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'Pug',
					sound: false,
					message: err.message
				}
			})
		}))
		.pipe( pug({
			pretty: true,
			locals : {
				data: data
			}
		}))
		.pipe( gulp.dest('./build/'))
        .pipe(browserSync.stream())
});

gulp.task('scss', function(callback){
    return gulp.src('./src/scss/main.scss')

        .pipe(plumber({
            errorHandler: function(err) {
            notify.onError({
                title: "Ошибка в CSS",
                message: "<%= error.message %>"
            })(err);
            }
        }))

        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 4 versions'],
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css/'))
        .pipe(browserSync.stream())
    callback(); 
})

gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    });
});

gulp.task('copy:img', function() {
    return gulp.src('./src/img/**/*.*')
        .pipe(gulp.dest('./build/img/'))
})

gulp.task('watch', function() {
    watch('./build/img', gulp.parallel( browserSync.reload))
    watch('build/**/*.css', gulp.parallel( browserSync.reload ))
    watch(['./src/scss/**/*.scss'], gulp.parallel('scss'))
    watch(['./src/pug/**/*.pug', './src/data/**/*.json'], gulp.parallel('pug'))
    watch('./src/data/**/*.json', gulp.parallel('pug'))
    watch('./src/img/**/*.*', gulp.parallel('copy:img'))
})

gulp.task('clean', function() {
    return del('./build')
})

gulp.task(
    'default', 
    gulp.series(
        gulp.parallel('clean'), 
        gulp.parallel('json', 'scss', 'pug'), 
        gulp.parallel('server', 'watch')
));
