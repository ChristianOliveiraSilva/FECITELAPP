<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Evaluator extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'PIN',
    ];

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
