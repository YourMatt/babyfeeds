module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        sass: {
            site: {
                options: {
                    sourcemap: "inline",
                    style: "nested"
                },
                files: {
                    "public/style/site.css": "frontend-src/scss/site.scss"
                }
            }
        },
        cssmin: {
            options: {
                sourceMap: false
            },
            minify_site_css: {
                files: [{
                    expand: true,
                    cwd: "public/style",
                    src: [
                        "*.css",
                        "!*.min.css"
                    ],
                    dest: "public/style",
                    ext: ".min.css"
                }]
            }
        },
        uglify: {
            uglify_site_js: { /* TODO: Fix this - Stopped working after removing non-react code */
                options: {
                    compress: true,
                    mangle: true,
                    sourceMap: true
                },
                files: {
                    "public/script/site.min.js": [
                        "public/script/site.js"
                    ]
                }
            }
        },
        browserify: {
            browserify_site_jsx: {
                files: {
                    "public/script/site.js": [
                        "frontend-src/js/site.jsx"
                    ]
                },
                options: {
                    transform: [
                        "babelify", "reactify"
                    ]
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            watch_scss_files: {
                files: [
                    "frontend-src/scss/*.scss",
                    "frontend-src/scss/*/*.scss"
                ],
                tasks: [
                    "sass:site",
                    "cssmin:minify_site_css"
                ]
            },
            /* // not working correctly - revisit later
            watch_js_files: {
                files: [
                    "public/script/site.js"
                ],
                tasks: [
                    "uglify:uglify_site_js"
                ]
            },
            */
            watch_jsx_files: {
                files: [
                    "frontend-src/js/*.jsx",
                    "frontend-src/js/api/*.jsx",
                    "frontend-src/js/components/*.jsx",
                    "frontend-src/js/utils/*.jsx"
                ],
                tasks: [
                    "browserify:browserify_site_jsx"
                ]
            }
        }
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-postcss");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("clean-dist", [
        "cssmin:minify_site_css"
    ]);
    grunt.registerTask("build", [
        "sass",
        "cssmin",
        "uglify",
        "browserify"
    ]);
    grunt.registerTask("default", [
        "watch"
    ]);

};