<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Response extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'question_id',
        'assessment_id',
        'response',
        'score',
    ];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }
}
