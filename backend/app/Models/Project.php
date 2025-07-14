<?php

namespace App\Models;

use App\Enum\ProjectTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'year',
        'category_id',
        'projectType',
        'external_id',
    ];

    protected $casts = [
        'projectType' => ProjectTypeEnum::class,
    ];

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_projects');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }

    public function getSchoolGradeAttribute()
    {
        return $this->students[0]->school_grade;
    }

    public function getNoteByQuestion(Question $question)
    {
        $assessmentsIds = $this->assessments->pluck('id');

        $responses = Response::where('question_id', $question->id)->whereIn('assessment_id', $assessmentsIds)->get();

        return $responses->avg('score');
    }

    public function getFinalNoteAttribute()
    {
        return round($this->assessments->filter(fn ($a) => $a->has_response)->avg('note'), 2);
    }
}
