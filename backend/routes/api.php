<?php

use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\SettingsController;
use App\Http\Controllers\IllnessController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\InventoryController;
use App\Http\Controllers\API\XuxedexController;
use App\Http\Controllers\XuxemonsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\JwtMiddleware;
use App\Http\Controllers\API\FriendshipController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\BattlesController;

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
        Route::post('/xuxedex/{owned_id}/illness', [XuxedexController::class, 'addIllness']);
        Route::delete('/xuxedex/{owned_id}/illness/{illness}', [XuxedexController::class, 'removeIllness']);
        Route::get('/xuxedex/owned/{user_id}', [XuxedexController::class, 'ownedXuxemonsByUser']); //ver los owned xuxemons de cada usuario
        Route::get('/settings', [SettingsController::class, 'index']);
        Route::put('/settings/update', [SettingsController::class, 'update']);
        Route::get('/illnesses', [IllnessController::class, 'index']);
        Route::put('/illnesses/update', [IllnessController::class, 'update']);
    });

    Route::put('/update', [UserController::class, 'updateUser']);
    Route::delete('/user', [UserController::class, 'deleteUser']);
    Route::post('/logout', [AuthController::class, 'logout']);

    //MOTXILLA
    Route::post('/inventory/add-item/{user}', [InventoryController::class, 'addItem']);
    Route::get('/inventory/users', [InventoryController::class, 'index']);
    Route::post('/inventory/{slot_id}/evolve', [InventoryController::class, 'evolve']);
    Route::get('/inventory/slots/{user}', [InventoryController::class, 'getAvailableSlots']);
    Route::get('/inventory', [InventoryController::class, 'getUserInventory']);
    Route::get('/inventory/items', [InventoryController::class, 'getAllItems']);
    Route::post('/xuxemons/{owned_id}/vaccinate', [XuxemonsController::class, 'giveVaccine']);
    Route::delete('/inventory/delete/item/{slot_id}', [InventoryController::class, 'deleteItem']);

    //XUXEDEX
    Route::get('/xuxedex/all', [XuxedexController::class, 'allXuxemons']);
    Route::get('/xuxedex', [XuxedexController::class, 'index']);
    Route::get('/xuxedex/users', [XuxedexController::class, 'users']);
    Route::post('/xuxedex/add-random/{user_id}', [XuxedexController::class, 'addRandom']);
    Route::get('/xuxedex/owned', [XuxedexController::class, 'ownedXuxemons']);
    Route::delete('/xuxedex/owned/{owned_id}', [XuxedexController::class, 'deleteOwnedXuxemon']);

    //XUXEMONS
    Route::post('/xuxemons/{id}/xuxe', [XuxemonsController::class, 'giveXuxe']);

    //NOTIFICACIONES
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/read', [NotificationController::class, 'deleteAllRead']);

    // FRIENDSHIPS
    Route::get('/friends', [FriendshipController::class, 'index']);
    Route::get('/friends/players', [FriendshipController::class, 'getAllPlayers']);
    Route::get('/friends/requests', [FriendshipController::class, 'getRequests']);
    Route::get('/friends/status', [FriendshipController::class, 'getStatus']);
    Route::get('/friends/requests/sent', [FriendshipController::class, 'getSentRequests']);
    Route::post('/friends/request', [FriendshipController::class, 'sendFriendRequest']);
    Route::delete('/friends/{id}/revoke', [FriendshipController::class, 'revokeFriendRequest']);
    Route::put('/friends/{id}/accept', [FriendshipController::class, 'acceptFriendRequest']);
    Route::put('/friends/{id}/reject', [FriendshipController::class, 'rejectFriendRequest']);
    Route::delete('/friends/{id}', [FriendshipController::class, 'destroy']);

    //XAT
    Route::post('/conversations', [ConversationController::class, 'createConversation']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages', [MessageController::class, 'index']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);
    Route::patch('/messages/{id}/edit', [MessageController::class, 'editMessage']);

    //BATALLES
    Route::get('/battles', [BattlesController::class, 'index']);
    Route::post('/battles', [BattlesController::class, 'store']);
    Route::post('/battles/{id}/accept', [BattlesController::class, 'acceptBattle']);
    Route::post('/battles/{id}/fight', [BattlesController::class, 'fight']);
});
