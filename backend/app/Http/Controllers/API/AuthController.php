<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Exceptions\JWTException;


class AuthController extends Controller
{
    // Register new user
    public function store(Request $request)
    {
        $request->validate([
            'player_id' => [
                'required',
                'string',
                'max:255',
                'unique:users,player_id',
                'regex:/^#[A-Za-z]+[0-9]{4}$/'
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'surname' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email'
            ],

            'password' => [
                'required',
                'string',
                'min:6'
            ],

            'role' => [
                'required',
                'in:user,admin'
            ],

            'pfp' => [
                'string'
            ],

            'level' => [
                'integer',
                'min:0',
                'max:150'
            ],

            'xp' => [
                'integer',
                'min: 0',
                'max: 1000'
            ],

            'active' => [
                'boolean'
            ],

            'active_friends' => [
                'integer',
                'min:0'
            ],

            'streak' => [
                'integer',
                'min:0'
            ]

        ]);

        $user = User::create([
            'player_id' => $request->player_id,
            'name' => $request->name,
            'surname' => $request->surname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'pfp' => $request->pfp,
            'level' => 0,
            'xp' => 0,
            'active' => false,
            'active_friends' => 0,
            'streak' => 0,
            'status' => 1
        ]);

        $token = Auth::guard('api')->login($user);

        return response()->json([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
            'user' => new UserResource($user)
        ]);
    }
    // Login user and return JWT token
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        // Especificamos el guard 'api' explícitamente
        if (!$token = Auth::guard('api')->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }


        //obtener usuario autenticado
        $user = Auth::guard('api')->user();

        //para usuarios no autorizados (status = 0)
        if($user->status == 0){
            return response()->json(['error' => 'This user is not active'], 403);
        }

        //marcar usuario como activo
        $user->active = true;
        $user->save();

        return $this->respondWithToken($token);
    }

    // Get user profile
    public function profile()
    {
        return response()->json(Auth::guard('api')->user());
    }

    // Logout user (invalidate token)
    public function logout()
    {
        $user = Auth::guard('api')->user();

        if ($user) {
            $user->active = false;
            $user->save();
        }
        
        Auth::guard('api')->logout();
        return response()->json(['message' => 'Successfully logged out']);
    }

    // Refresh JWT token
    public function refresh()
    {
       return $this->respondWithToken(Auth::guard('api')->refresh());
    }

    // Return token response structure
    protected function respondWithToken($token)
    {
        return response()->json([
            'token' => $token,
            'user_id' => Auth::guard('api')->user()->id,
            'token_type'   => 'bearer',
            'expires_in'   => Auth::guard('api')->factory()->getTTL() * 60,
        ]);
    }
}
