<?php

namespace App\Models;

use App\Enum\QuestionTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Award extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'name',
        'school_grade_id',
    ];

    public function schoolGrade()
    {
        return $this->belongsTo(SchoolGrade::class);
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class)->withPivot('weight');
    }

    public function getWinnerAttribute()
    {
        $questions = $this->questions->where('type', QuestionTypeEnum::MULTIPLE_CHOICE);

        $maxScore = $questions->flatMap(function ($question) {
            return $question->responses;
        })->max('score');
        
        $topResponses = $questions->flatMap(function ($question) {
            return $question->responses;
        })->filter(function ($response) use ($maxScore) {
            return $response['score'] == $maxScore;
        });

        $studentNames = $topResponses->flatMap(function ($response) {
            return $response->assessment->project->students;
        })->pluck('name')->implode(', ');

        return $studentNames;
    }

    public function getWinnerScoreAttribute()
    {
        $questions = $this->questions->where('type', QuestionTypeEnum::MULTIPLE_CHOICE);

        $maxScore = $questions->flatMap(function ($question) {
            return $question->responses;
        })->max('score');

        return $maxScore;
    }
}
