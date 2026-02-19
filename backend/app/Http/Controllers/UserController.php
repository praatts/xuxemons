<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class UserController extends Controller
{
    //mostrar listado usuarios
    public function index()
    {
        $users = User::all();
        return UserResource::collection($users);
    }


    public function checkEmail(Request $request)
    {
        $email = $request->query('email');
        $exists = User::where('email', $email)->exists();
        return response()->json(['exists' => $exists]);
    }

    //mostrar perfil usuario
    public function getUser()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }
            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to fetch user profile'], 500);
        }
    }

    //actualizar perfil usuario
    public function updateUser(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
                
            }

            $user_to_update = User::where('email', $request->input('email'))->first();
            $user_to_update->update($request->only(['name', 'email']));
            return response()->json($user_to_update);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to update user'], 500);
        }
    }
}
