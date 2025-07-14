<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AssessmentController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (!$user || !$user->evaluator) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não autorizado ou não é um avaliador.',
                'data' => [],
            ], 403);
        }

        $assessments = $user->evaluator->assessments()
            ->whereHas('project', function ($query) {
                $query->where('year', date('Y'));
            })
            ->with(['project.students', 'project.category', 'responses'])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Avaliações recuperadas com sucesso.',
            'data' => $assessments,
        ]);
    }
} 