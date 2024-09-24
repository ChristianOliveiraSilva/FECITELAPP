<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'main_category_id',
    ];

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function evaluators()
    {
        return $this->belongsToMany(Evaluator::class, 'evaluator_categories');
    }

    public static function mainCategories()
    {
        return self::whereNull('main_category_id')->get();
    }

    public function mainCategory()
    {
        return $this->belongsTo(Category::class, 'main_category_id');
    }

    public function subCategories()
    {
        return $this->hasMany(Category::class, 'main_category_id');
    }
}
