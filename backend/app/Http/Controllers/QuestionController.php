<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Question;

class QuestionController extends Controller
{
    public function getByAssessment(Assessment $assessment)
    {
        $projectType = $assessment->project->projectType;
        $questions = Question::all();

        return response()->json([
            'success' => true,
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