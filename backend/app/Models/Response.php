<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Response extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'evaluator_id',
        'project_id',
        'question_id',
        'response',
        'score',
    ];

    public function evaluator()
    {
        return $this->belongsTo(Evaluator::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
