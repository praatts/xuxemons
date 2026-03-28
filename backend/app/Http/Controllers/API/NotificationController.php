<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    //Devuelve las notificaciones del usuario autenticado
    public function index(Request $request): JsonResponse
    {

        $user = Auth::guard('api')->user();

        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    public function markAsRead($id): JsonResponse
    {
        $user = Auth::guard('api')->user();

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json(['error' => 'Notificación no encontrada'], 404);
        }

        $notification->read = true;
        $notification->save();

        return response()->json(['message' => 'Notificación marcada como leída']);
    }

    public function markAllAsRead() : JsonResponse {
        $user = Auth::guard('api')->user();

        $notifications = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->update(['read'=> true]);

        return response()->json(['message' => 'Todas las notificaciones marcadas como leídas']);
    }

    public function deleteAllRead() : JsonResponse {
        $user = Auth::guard('api')->user();

        $delete = Notification::where('user_id', $user->id)
            ->where('read', true)
            ->delete();

        return response()->json(['message' => "Se han eliminado {$delete} notificaciones leídas"]);
    }
}
