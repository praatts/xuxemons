<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\API\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\JwtMiddleware;

//Comprobar si el email ya existe
Route::get('/check-email', [UserController::class, 'checkEmail']);

//Autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'store']);

//debug
Route::get('/check-headers', function (Request $request) {
    return response()->json([
        'all_headers' => $request->headers->all(),
        'auth_header' => $request->header('Authorization'),
        'bearer_token' => $request->bearerToken(),
    ]);
});

//Agrupamos las rutas que requieren autenticación con el middleware JWT
Route::middleware([JwtMiddleware::class])->group(function () {
    Route::get('/profile', [UserController::class, 'getUser']);
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/update', [UserController::class, 'updateUser']);
    Route::delete('/user', [UserController::class, 'deleteUser']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
