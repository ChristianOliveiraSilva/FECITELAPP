<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assessment extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'evaluator_id',
        'project_id',
    ];

    protected $appends = [
        'has_response'
    ];

    public function evaluator()
    {
        return $this->belongsTo(Evaluator::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function responses()
    {
        return $this->hasMany(Response::class);
    }

    public function getHasResponseAttribute()
    {
        return $this->responses()->exists();
    }
}