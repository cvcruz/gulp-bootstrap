# gulp-bootstrap
gulpfile I am using for node server (though node app.js file is not in repo yet so I have excluded nodemon tasks)

* minifies and concatenates common/shared CSS files (assuming a shared code-base with branding capabilities) and appends version number from package.json file to filename (e.g., common_1.0.0.min.css)
* minifies and concatenates project (branded) CSS files
* compiles LESS to CSS
* minifies and concatenates JS

# directory structure:
|- BASEDIR/  
     |- dev/
         |- projectdir/
             |- css
             |- img
             |- js
             |- less
     |- lib/
     |- public/
         |- css/
         |- fonts/
         |- img/ 
         |- js/ 
    |- app.js
    |- gulpfile.js
    |- package.json
