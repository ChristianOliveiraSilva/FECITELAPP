<?php

namespace App\Http\Controllers;

use App\Enum\QuestionTypeEnum;
use App\Models\Assessment;
use App\Models\Response;
use Illuminate\Http\Request;

class ResponseController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->all();

        $assessment = Assessment::find($data['assessment']);
        $responses = collect($data['responses']);

        if (!$assessment) {
            return response()->json([
                'success' => false,
                'message' => 'Avaliação não encontrada',
            ], 404);
        }

        if ($assessment->has_response) {
            $assessment->responses()->delete();
        }

        $responses->each(function($response) use($assessment) {
            $responseValue = $response['type'] == QuestionTypeEnum::TEXT->value ? $response['value'] : null;
            $scoreValue = $response['type'] == QuestionTypeEnum::MULTIPLE_CHOICE->value ? $response['value'] : null;
            
            Response::create([
                'question_id' => $response['question_id'],
                'assessment_id' => $assessment->id,
                'response' => $responseValue,
                'score' => $scoreValue,
            ]);
        });

        $assessment->load('responses.question');

        return response()->json([
            'success' => true,
            'message' => 'Respostas salvas com sucesso.',
            'data' => $assessment,
        ]);
    }
} 