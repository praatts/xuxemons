<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Ruta de test

Route::get('/test', function (Request $request) {
    return response()->json(['message' => 'Endpoint funcionant'], 201);
}); 