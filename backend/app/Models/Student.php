<?php

namespace App\Models;

use App\Enum\SchoolGradeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'school_id',
        'school_grade',
    ];

    protected $casts = [
        'school_grade' => SchoolGradeEnum::class,
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'student_projects');
    }
}
