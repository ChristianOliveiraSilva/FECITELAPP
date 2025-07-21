<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class QuestionController extends Controller
{
    public function getByAssessment(Request $request, Assessment $assessment): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json([
                'status' => false,
                'message' => 'Usuário não autenticado'
            ], 401);
        }

        $user = Auth::user();

        $evaluator = $user->evaluator;
        if (!$evaluator) {
            return response()->json([
                'status' => false,
                'message' => 'Usuário não é um avaliador'
            ], 403);
        }

        if ($assessment->evaluator_id !== $evaluator->id) {
            return response()->json([
                'status' => false,
                'message' => 'Você não tem permissão para acessar esta avaliação'
            ], 403);
        }

        $projectType = $assessment->project->projectType;
        $questions = Question::all();

        return response()->json([
            'status' => true,
            'data' => [
                'project_type' => [
                    'value' => $projectType->value,
                    'label' => $projectType->getLabel(),
                ],
                'questions' => $questions,
            ],
        ]);
    }
} 