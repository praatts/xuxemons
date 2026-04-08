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
    // Mètode que regisra un nou usuari a la base de dades
    public function store(Request $request)
    {

        //Valida que les dades introduïdes compleixen els validadors
        $request->validate([
            'player_id' => [
                'required',
                'string',
                'max:255',
                'unique:users,player_id',
                'regex:/^#[A-Za-z0-9]+[0-9]{4}$/'
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
                'string',
                'nullable'
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

        //Crea el usuari
        $user = User::create([
            'player_id' => $request->player_id,
            'name' => $request->name,
            'surname' => $request->surname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'pfp' => $request->pfp ?? 'https://img.freepik.com/vector-premium/icono-perfil-usuario-estilo-plano-ilustracion-vector-avatar-miembro-sobre-fondo-aislado-concepto-negocio-signo-permiso-usuario_157943-15752.jpg?semt=ais_hybrid', //cargar imagen de usuario por defecto
            'level' => 0,
            'xp' => 0,
            'active' => false,
            'active_friends' => 0,
            'streak' => 0,
            'status' => 1
        ]);

        //Genera el token JWT per a l'usuari registrat
        $token = Auth::guard('api')->login($user);

        //Retorna el token e informació de l'usuari
        return response()->json([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 120,
            'user' => new UserResource($user)
        ]);
    }
    // Mètode que autentica un usuari i retorna un token JWT
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        // Especificamos el guard 'api' explícitamente
        if (!$token = Auth::guard('api')->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }


        //Obtenir usuari autenticat
        $user = Auth::guard('api')->user();

       //Valida que l'usuari està habilitat abans de autenticar.
        if ($user->status == 0) {
            return response()->json(['error' => 'This user is not active'], 403);
        }

        //Marca l'usuari com actiu al iniciar sessió
        $user->active = true;
        $user->save();

        //Retorna el token JWT i informació de l'usuari
        return $this->respondWithToken($token);
    }

    // Mètode que retorna el perfil de l'usuari autenticat
    public function profile()
    {
        return response()->json(Auth::guard('api')->user());
    }

    // Tancar sessió de l'usuari (invalidar token)
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
