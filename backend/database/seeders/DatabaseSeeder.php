<?php

namespace Database\Seeders;

use App\Enum\AreaEnum;
use App\Enum\QuestionTypeEnum;
use App\Models\Assessment;
use App\Models\User;
use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\Category;
use App\Models\Project;
use App\Models\Evaluator;
use App\Models\Question;
use App\Models\Response;
use App\Models\Award;
use App\Models\SchoolGrade;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SchoolGradeSeeder::class,
            CategorySeeder::class,
            QuestionSeeder::class,
        ]);
        
        if (env('APP_ENV') !== 'production') {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@ifms.edu.br',
            ]);
        }

        User::factory()->create([
            'name' => 'Rogério Alves dos Santos Antoniassi',
            'email' => 'rogerio.antoniassi@ifms.edu.br',
            'password' => bcrypt(env('APP_ENV') === 'production' ? 'R8$hG7@fK4jLp9#Qw1ZuV2' : 'password'),
        ]);
        
        User::factory()->create([
            'name' => 'Alex Fernando de Araujo',
            'email' => 'alex.araujo@ifms.edu.br',
            'password' => bcrypt(env('APP_ENV') === 'production' ? 'm5^Tz8*QrW3&yJ0@bC6xL7' : 'password'),
        ]);
    }
}
