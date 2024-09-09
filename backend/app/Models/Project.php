<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'qr_code',
        'description',
        'year',
        'category_id',
    ];

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_projects');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }
}
