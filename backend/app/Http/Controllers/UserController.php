<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
            $user = Auth::guard('api')->user();

            if (!$user) {
                return response()->json(['error' => 'User not found or invalid token'], 404);
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
            $user = Auth::guard('api')->user();

            if (!$user) {
                return response()->json(['error' => 'User not found or token invalid'], 404);
            }

            $data = $request->only(['name', 'surname', 'email', 'pfp']);

            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $user->update($data);

            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to update user'], 500);
        }
    }

    public function deleteUser(){
        try {
            $user = Auth::guard('api')->user();

            if (!$user) {
                return response()->json(['error' => 'User not found or token invalid'], 404);
            }

            $user->delete();

            return response()->json(['message' => 'User deleted successfully']);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to delete user'], 500);
        }
    }
}
