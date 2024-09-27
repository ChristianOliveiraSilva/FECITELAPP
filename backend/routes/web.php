<?php

use App\Enum\QuestionTypeEnum;
use App\Http\Controllers\MobileAuthController;
use App\Models\Assessment;
use App\Models\Evaluator;
use App\Models\Question;
use App\Models\Response;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin');
});

Route::post('/login', [MobileAuthController::class, 'login']);

Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::post('/logout', [MobileAuthController::class, 'logout']);

    Route::get('/assessments', function () {
        return Auth::user()?->evaluator->assessments()
            ->whereHas('project', function ($query) {
                $query->where('year', date('Y'));
            })
            ->with(['project.students', 'project.category', 'responses'])
            ->get();
    });

    Route::get('/questions/{assessment}', function (Assessment $assessment) {
        return Question::where('area', $assessment->project->area->value)->get();
    });

    Route::post('/responses', function () {
        $data = request()->all();

        $assessment = Assessment::find($data['assessment']);
        $responses = collect($data['responses']);

        if (!$assessment) {
            return "Avaliação não encontrada";
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

        return $assessment->load('responses.question');
    });
});
