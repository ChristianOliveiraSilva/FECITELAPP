<?php

use App\Enum\QuestionTypeEnum;
use App\Http\Controllers\MobileAuthController;
use App\Models\Assessment;
use App\Models\Category;
use App\Models\Evaluator;
use App\Models\Question;
use App\Models\Response;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Redirect;

Route::get('/', function () {
    return redirect('/admin');
});

Route::post('/login', [MobileAuthController::class, 'login'])->name('login');

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

Route::get('/add', function () {
    return view('add', [
        'evaluators' => Evaluator::with('user')->get()->sortBy('user.name')
    ]);
});

Route::post('/add', function () {
    $data = request()->all();

    $structuredData = [
        'data' => [
            [
                'title' => trim($data['title']),
                'category_id' => trim($data['category_id']),
                'area' => trim($data['area']),
                'external_id' => trim($data['external_id']),
                'grau_escolar' => trim($data['grau_escolar']),
                'escola' => trim($data['escola']),
                'students' => [
                    [
                        'name' => trim($data['student1_name']),
                        'email' => trim($data['student1_email']),
                    ],
                ],
                'evaluator1_id' => $data['evaluator1_id'] ?? null,
                'evaluator2_id' => $data['evaluator2_id'] ?? null,
                'evaluator3_id' => $data['evaluator3_id'] ?? null,
            ]
        ]
    ];

    for ($i = 2; $i <= 5; $i++) {
        if (!empty($data["student${i}_name"])) {
            $structuredData['data'][0]['students'][] = [
                'name' => trim($data["student${i}_name"]),
                'email' => trim($data["student${i}_email"]),
            ];
        } else {
            break;
        }
    }

    $jsonFilePath = storage_path('../database/seeders/data/dados.json');
    $backupFilePath = storage_path('../database/seeders/data/dados_backup.json');

    try {
        if (File::exists($jsonFilePath)) {
            $existingData = json_decode(File::get($jsonFilePath), true);
            
            $existingData['data'][] = $structuredData['data'][0];

            File::put($jsonFilePath, json_encode($existingData, JSON_PRETTY_PRINT));

            File::copy($jsonFilePath, $backupFilePath);
        } else {
            File::put($jsonFilePath, json_encode($structuredData, JSON_PRETTY_PRINT));
        }

        Session::flash('success', 'Dados salvos com sucesso!');
    } catch (\Exception $e) {
        Session::flash('error', 'Erro ao salvar os dados: ' . $e->getMessage());
    }

    return Redirect::back();
});