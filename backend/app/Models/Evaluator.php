<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluator extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'PIN',
    ];

    public function responses()
    {
        return $this->hasMany(Response::class);
    }
}
