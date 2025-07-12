<?php

use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\MobileAuthController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\ResponseController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [MobileAuthController::class, 'login'])->name('login');

Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::post('/logout', [MobileAuthController::class, 'logout']);

    Route::get('/assessments', [AssessmentController::class, 'index']);
    Route::get('/questions/{assessment}', [QuestionController::class, 'getByAssessment']);
    Route::post('/responses', [ResponseController::class, 'store']);
});
