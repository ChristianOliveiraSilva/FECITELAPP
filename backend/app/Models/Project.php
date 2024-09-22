<?php

namespace App\Models;

use App\Enum\AreaEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'year',
        'category_id',
        'area',
        'external_id',
    ];

    protected $casts = [
        'area' => AreaEnum::class,
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
