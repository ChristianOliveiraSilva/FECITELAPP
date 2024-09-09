<?php

use App\Models\Assessment;
use App\Models\Evaluator;
use App\Models\Question;
use App\Models\Response;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/assessments', function () {
    Auth::loginUsingId(2); # remover
    return Auth::user()?->evaluator->assessments()
        ->whereHas('project', function ($query) {
            $query->where('year', 2024);
        })
        ->with(['project.students', 'responses'])
        ->get();

});

Route::get('/questions', function () {
    return Question::all();
});

Route::get('/responses', function () {
    $data = request()->all();
    $responses = $data['responses'];
    $assessment = $data['assessment'];

    $responses->each(function($response) use($assessment) {
        Response::create([
            'question_id' => $response['question_id'],
            'assessment_id' => $assessment,
            'response' => $response['response'],
            'score' => $response['score'],
        ]);
    });

    return Assessment::find($assessment)->load('responses.question');
});
