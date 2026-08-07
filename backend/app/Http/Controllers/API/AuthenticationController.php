<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthenticationController extends Controller
{
    //Create a new user and store it in the database 
    
    public function signup(Request $request){
        $request->validate([
            'name'=>'required|string|min:3|max:255',
            'email'=> 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        /* Calling the User model to create a new one */
        User::create([
            'name'=> $request->name,
            'email'=> $request->email,
            'password'=> Hash::make($request->password),
            ]);

        return response()->json(['message'=>'User registered successfully']);
    }

    /*  Authenticate an user an return  data  */

    public function login(Request $request){

        //Validate an user with its own credentials 
        
        $request->validate([
            'email'=> 'required|email',
            'password' => 'required'
        ]);

        //Check if the user exists in the database and if the password is correct

        if(!Auth::attempt($request->only('email', 'password'))){
            return response()->json(['message'=>'Invalid credentials, please try again'] );
        }

        $token = Auth::user()->createToken('API Token')->plainTextToken;

        return response()->json([
            'message'=>'Login successfully',
            'token'=> $token
            ]);

    }

    public function userInfo(Request $request){
        return response()->json($request->user());
    }


    public function logOut(Request $request){
        $request->user()->tokens()->delete();
        Auth::logout();
        return response()->json(['message'=>'Logged out successfully']);
    }

}
