<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'school_grade_id',
        'school',
    ];

    public function schoolGrade()
    {
        return $this->belongsTo(SchoolGrade::class);
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'student_projects');
    }
}
