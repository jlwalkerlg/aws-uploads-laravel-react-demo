<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\UnauthorizedException;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $data = $this->validate($request, [
                'name' => 'required',
                'email' => 'required|email|unique:users',
                'password' => 'required|min:5',
            ]);
        } catch (ValidationException $e) {
            return response()->json($e->errors(), 400);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'api_token' => Str::random(80),
        ]);

        return response()->json($user, 200)->withCookie('api_token', $user->api_token, 60 * 24 * 14);
    }

    public function login(Request $request)
    {
        try {
            $data = $this->validate($request, [
                'email' => 'required',
                'password' => 'required',
            ]);
        } catch (ValidationException $e) {
            return response()->json($e->errors(), 400);
        }

        $user = User::query()->where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw new UnauthorizedException();
        }

        $user->update([
            'api_token' => Str::random(80),
        ]);

        return response()->json($user, 200)->withCookie('api_token', $user->api_token, 60 * 24 * 14);
    }

    public function logout(Request $request)
    {
        if (!$request->user()) {
            return response()->json(null, 200)->withCookie('api_token', null);
        }

        $request->user()->update(['api_token' => null]);

        return response()->json(null, 200)->withCookie('api_token', null);
    }
}
