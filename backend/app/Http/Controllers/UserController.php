<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
     public function index(){
        $users = User::all();
        return response()->json($users);
    }

    public function store(Request $request){
        $request->validate([
            'player_id' => [
                'required',
                'string',
                'max:255',
                'unique:users,player_id',
                'regex:/^[A-Za-z]+#[0-9]{4}$/'
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
        ]);

        $user = User::create([
            'player_id' => $request->player_id,
            'name' => $request->name,
            'surname' => $request->surname,
            'email' => $request->email,
            'password' => $request->password,
            'role' => $request->role
        ]);

        return response()->json($user, 201);
    }
}
