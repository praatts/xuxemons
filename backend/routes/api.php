<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\JwtMiddleware;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Ruta de test

Route::get('/test', function (Request $request) {
    return response()->json(['message' => 'Endpoint funcionant'], 201);
});

//gestion usuarios
Route::get('/users', [UserController::class, 'index']);
Route::get('/profile', [UserController::class, 'getUser'])->middleware('JwtMiddleware');
Route::put('/update', [UserController::class, 'updateUser'])->middleware('JwtMiddleware');

//Autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('JwtMiddleware');
Route::post('/register', [AuthController::class, 'store']);