<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function getByAssessment(Assessment $assessment)
    {
        return Question::where('area', $assessment->project->area->value)->get();
    }
} 