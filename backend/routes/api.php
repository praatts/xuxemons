<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\API\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\JwtMiddleware;

// Ruta de test
Route::get('/test', function (Request $request) {
    return response()->json(['message' => 'Endpoint funcionant'], 201);
});

//gestion usuarios
Route::get('/users', [UserController::class, 'index']);
Route::get('/profile', [UserController::class, 'getUser']);
Route::put('/update', [UserController::class, 'updateUser']);



//Comprobar si el email ya existe
Route::get('/check-email', [UserController::class, 'checkEmail']);

//Autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/register', [AuthController::class, 'store']);


Route::get('/check-headers', function (Illuminate\Http\Request $request) {
    return response()->json([
        'all_headers' => $request->headers->all(),
        'auth_header' => $request->header('Authorization'),
        'bearer_token' => $request->bearerToken(),
    ]);
});