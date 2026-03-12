<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\InventoryController;
use App\Http\Controllers\API\XuxedexController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\JwtMiddleware;
use App\Models\Inventory;

//http://localhost:8000/api/
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
    Route::get('/users', [UserController::class, 'index']); //mostrar nada mas usuarios status en true
    
    // ADMIN ONLY ROUTES
    Route::middleware(['AdminMiddleware'])->group(function () {
        Route::get('/users/all', [UserController::class, 'getAllUsers']); //mostrar usuarios en status false y true
        Route::post('/users/{id}/restore', [UserController::class, 'restoreUser']); //restore users status 0
        Route::delete('/users/{id}/delete', [UserController::class, 'adminDelete']); //delete users status 0
    });

    Route::put('/update', [UserController::class, 'updateUser']);
    Route::delete('/user', [UserController::class, 'deleteUser']);
    Route::post('/logout', [AuthController::class, 'logout']);

    //MOTXILLA
    Route::post('/inventory/add-xuxes/{user}', [InventoryController::class, 'addXuxes']);
    Route::get('/inventory/users', [InventoryController::class, 'index']);
    Route::post('/inventory/{slot_id}/evolve', [InventoryController::class, 'evolve']);
    Route::get('/inventory/slots/{user}', [InventoryController::class, 'getAvailableSlots']);
    Route::get('/inventory', [InventoryController::class, 'getUserInventory']);

    //XUXEDEX
    Route::get('/xuxedex/all', [XuxedexController::class, 'allXuxemons']);
    Route::get('/xuxedex', [XuxedexController::class, 'index']);
    Route::get('/xuxedex/users', [XuxedexController::class, 'users']);
    Route::post('/xuxedex/add-random/{user_id}', [XuxedexController::class, 'addRandom']);
});
