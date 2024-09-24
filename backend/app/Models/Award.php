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
        'total_positions',
        'use_school_grades',
        'use_categories',
    ];

    public function schoolGrade()
    {
        return $this->belongsTo(SchoolGrade::class);
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class);
    }

    public function getWinner($position = null, $school = null, $categoryId = null)
    {
        $questions = $this->questions->where('type', QuestionTypeEnum::MULTIPLE_CHOICE);

        $validResponses = $questions->flatMap(fn ($question) => $question->responses)
            ->filter(function ($response) use($school, $categoryId) {
                if (!$categoryId && !$school) {
                    return $response;
                }

                $schoolId = $school == 'Ensino Fundamental' ? 1 : 2;
                $categoryCondition = $response->assessment->project->category_id == $categoryId;
                $schoolCondition = $response->assessment->project->school_grade_id == $schoolId;

                if ($categoryId && $school) {
                    return $categoryCondition && $schoolCondition;
                }
                
                if ($categoryId) {
                    return $categoryCondition;
                }
                
                return $schoolCondition;
            });

        if ($validResponses->count() == 0) {
            return 'Não houve competidor';
        }

        // $highScore = $validResponses->max('score');
        // $topResponses = $validResponses->where('score', $highScore);
        dd($this);
        $orderedResponses = dd($validResponses->sortByDesc('score'));
        $scores = [];

        foreach ($orderedResponses as $response) {
            $scores[$response->score][] = $response;
        }


        dd($scores);

        // $studentNames = $targetResponses->flatMap(function ($response) {
        //     return $response->assessment->project->students;
        // })->pluck('name')->implode(', ');

        // return $studentNames;
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
