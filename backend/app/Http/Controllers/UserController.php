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
        $users = User::where('status', 1)->get();
        return UserResource::collection($users);
    }

    public function getAllUsers()
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

            if ($user->role === 'admin') {
                return response()->json(['error' => 'An admin user cannot be deleted'], 403);
            }

            $user->status = 0;
            $user->save();

            return response()->json(['message' => 'User deleted successfully']);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to delete user'], 500);
        }
    }


    public function restoreUser($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            $user->status = 1;
            $user->save();

            return response()->json([
                'message' => 'User restored successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to restore user'], 500);
        }
    }

    public function adminDelete($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            if ($user->role === 'admin') {
                return response()->json(['error' => 'An admin user cannot be deactivated'], 403);
            }

            $user->status = 0;
            $user->save();

            return response()->json(['message' => 'User deactivated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to deactivate user'], 500);
        }
    }

}
