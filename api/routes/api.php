<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/me', function (Request $request) {
    return $request->user();
})->middleware('auth:api');

Route::post('/login', 'AuthController@login');
Route::post('/register', 'AuthController@register');
Route::post('/logout', 'AuthController@logout');

Route::get('/gallery', 'GalleryController@index');
Route::post('/gallery', 'GalleryController@store')->middleware('auth:api');
Route::delete('/gallery/{image}', 'GalleryController@destroy')->middleware('auth:api');

Route::get('/videos', 'VideosController@index');
Route::post('/videos', 'VideosController@store')->middleware('auth:api');
Route::delete('/videos/{video}', 'VideosController@destroy')->middleware('auth:api');
