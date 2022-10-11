const mix = require('laravel-mix');
const tailwindcss = require('tailwindcss');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */
 mix.webpackConfig({ // 追加 -> sassファイルを一括コンパイルする
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.scss/,
                loader: 'import-glob-loader'
            }
        ]
    }
});

mix.setPublicPath('./public_html/');

mix.ts('resources/ts/app.tsx', 'public_html/js')
    .js('resources/js/app.js', 'public_html/js')
    .sass('resources/sass/app.scss', 'public_html/css')
    .options({
        processCssUrls: false,
        postCss: [tailwindcss('./tailwind.config.js')],
    });