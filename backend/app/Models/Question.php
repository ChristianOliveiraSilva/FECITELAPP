<?php

namespace App\Models;


use App\Enum\QuestionTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'scientific_text',
        'technological_text',
        'type',
        'number_alternatives',
    ];

    protected $casts = [
        'type' => QuestionTypeEnum::class,
    ];

    public function responses()
    {
        return $this->hasMany(Response::class);
    }

    public function awards()
    {
        return $this->belongsToMany(Award::class);
    }

    public function getDisplayTextAttribute()
    {
        // Show both texts separated by a line break
        return $this->scientific_text . "\n\n" . $this->technological_text;
    }
}
