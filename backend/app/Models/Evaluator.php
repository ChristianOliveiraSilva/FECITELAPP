<?php

namespace App\Models;

use App\Enum\ProjectTypeEnum;
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

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'evaluator_categories');
    }

    public static function generateRandomPin() {
        do {
            $pin = rand(1111, 9999);

            $pinExists = self::where('PIN', $pin)->exists();
        } while ($pinExists);

        return $pin;
    }

    public function getTotalProjectsAttribute() {
        return $this->assessments->count();
    }
}
