<?php

use Illuminate\Support\Facades\Route;

/*
| Serve the built React SPA. The Vite build (frontend/dist) is copied into
| this app's public/ folder, so public/index.html is the SPA entry point.
| Any non-API, non-file route falls through to index.html so client-side
| routing (e.g. /admin/login) works on direct load and refresh.
*/
Route::get('/{any?}', function () {
    $spa = public_path('index.html');

    abort_unless(file_exists($spa), 404);

    return response()->file($spa);
})->where('any', '^(?!api|storage).*$');
