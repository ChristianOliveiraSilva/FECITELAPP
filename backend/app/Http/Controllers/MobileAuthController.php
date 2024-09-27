<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MobileAuthController extends Controller
{
  public function login(Request $request)
  {
    try {
      $request->validate([
        'PIN' => 'required',
      ]);

      $user = User::whereHas('evaluator', function ($q) use ($request) {
        $q->where('PIN', $request->PIN);
      })->first();

      if (!$user) {
        return response()->json(['status' => false, 'message' => 'Nenhum usuário encontrado com o PIN fornecido'], 403);
      }

      return response()->json([
        'status' => true,
        'message' => 'Usuário logado com sucesso',
        'data' => [
          'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
          ],
          'plainTextToken' => $user->createToken('all')->plainTextToken
        ]
      ], 200);
    } catch (\Throwable $th) {
      return response()->json(['status' => false, 'message' => 'Falha ao logar'], 403);
    }
  }

  public function logout(Request $request)
  {
    try {
      $result = Auth::user()->tokens()->delete();

      return response()->json(['status' => true, 'message' => 'Logout realizado com sucesso', 'data' => [
        'result' => $result
      ]], 200);
    } catch (\Throwable $th) {
      DB::rollback();
      return response()->json(['status' => false, 'message' => 'Falha ao deslogar'], 403);
    }
  }
}
