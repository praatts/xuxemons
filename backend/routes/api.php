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
    //USUARIO
    Route::get('/profile', [UserController::class, 'getUser']);
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/update', [UserController::class, 'updateUser']);
    Route::delete('/user', [UserController::class, 'deleteUser']);
    Route::post('/logout', [AuthController::class, 'logout']);

    //MOTXILLA
    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::post('/inventory/add', [InventoryController::class, 'add']);
    Route::post('/inventory/{slot_id}/evolve', [InventoryController::class, 'evolve']);

    //XUXEDEX
    Route::get('/xuxedex', [XuxedexController::class, 'index']);
    Route::get('/xuxedex/users', [XuxedexController::class, 'users']);
    Route::post('/xuxedex/add-random/{user_id}', [XuxedexController::class, 'addRandom']);
});
