<?php

namespace App\Models;

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
}
