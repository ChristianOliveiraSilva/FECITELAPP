<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'text',
        'type',
    ];

    public function responses()
    {
        return $this->hasMany(Response::class);
    }

    public function awards()
    {
        return $this->belongsToMany(Award::class)->withPivot('weight');
    }
}