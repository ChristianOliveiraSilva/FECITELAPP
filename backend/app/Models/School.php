<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class School extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'city',
        'state',
    ];

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function getFullNameAttribute()
    {
        $parts = [$this->name];
        
        if ($this->city) {
            $parts[] = $this->city;
        }
        
        if ($this->state) {
            $parts[] = $this->state;
        }
        
        return implode(' - ', $parts);
    }
} 