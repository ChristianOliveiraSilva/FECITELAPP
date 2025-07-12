<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AssessmentController extends Controller
{
    public function index()
    {
        return Auth::user()?->evaluator->assessments()
            ->whereHas('project', function ($query) {
                $query->where('year', date('Y'));
            })
            ->with(['project.students', 'project.category', 'responses'])
            ->get();
    }
} 