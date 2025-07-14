<?php

namespace App\Models;

use App\Enum\QuestionTypeEnum;
use App\Enum\SchoolGradeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Award extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'name',
        'school_grade',
        'total_positions',
        'use_school_grades',
        'use_categories',
    ];

    protected $casts = [
        'school_grade' => SchoolGradeEnum::class,
    ];

    public function questions()
    {
        return $this->belongsToMany(Question::class);
    }
    
    public function getWinner($position = null, $school = null, $categoryId = null) 
    {
        $questions = $this->questions->where('type', QuestionTypeEnum::MULTIPLE_CHOICE);

        $scores = $questions->flatMap(function ($question) {
            return $question->responses;
        })->sortByDesc('score');

        $score = $scores[$position - 1] ?? null;

        if (!$score) {
            return 'Não houve competidor';        
        }

        return $score?->assessment?->project?->students[0]?->name ?? 'Não houve competidor';        
    }

    public function getWinnerScore($position)
    {
        $questions = $this->questions->where('type', QuestionTypeEnum::MULTIPLE_CHOICE);

        $scores = $questions->flatMap(function ($question) {
            return $question->responses;
        })->sortByDesc('score');

        return $scores[$position - 1]->score ?? '-';
    }
}
