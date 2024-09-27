<?php

namespace App\Models;

use App\Enum\AreaEnum;
use App\Enum\QuestionTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'text',
        'type',
        'area',
        'number_alternatives',
    ];

    protected $casts = [
        'type' => QuestionTypeEnum::class,
        'area' => AreaEnum::class,
    ];

    public function responses()
    {
        return $this->hasMany(Response::class);
    }

    public function awards()
    {
        return $this->belongsToMany(Award::class);
    }
}
