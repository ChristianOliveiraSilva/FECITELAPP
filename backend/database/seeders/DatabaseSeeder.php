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
        ]);
        
        if (env('APP_ENV') !== 'production') {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@ifms.edu.br',
            ]);

            User::factory()->create(
                ['name' => 'Dra. Juliana Costa', 'email' => 'juliana.costa@example.com'],
            );

            User::factory()->create(
                ['name' => 'Prof. João Pereira', 'email' => 'joao.pereira@example.com'],
            );

            $elementarySchool = SchoolGrade::where('name', 'Ensino Fundamental')->first();
            $highSchool = SchoolGrade::where('name', 'Ensino médio')->first();

            Student::insert([
                ['name' => 'Ana Souza', 'email' => 'ana.souza@example.com', 'school_grade_id' => $elementarySchool->id],
                ['name' => 'Carlos Silva', 'email' => 'carlos.silva@example.com', 'school_grade_id' => $highSchool->id],
            ]);

            Project::insert([
                [
                    'title' => 'Pesquisa em IA',
                    'description' => 'Um projeto sobre inteligência artificial.',
                    'year' => 2024,
                    'area' => AreaEnum::TECHNICAL,
                    'category_id' => 5,
                ],
                [
                    'title' => 'Computação Quântica',
                    'description' => 'Um projeto explorando conceitos de computação quântica.',
                    'year' => 2024,
                    'area' => AreaEnum::SCIENTIFIC,
                    'category_id' => 5,
                ],
            ]);

            DB::table('student_projects')->insert([
                ['project_id' => 1, 'student_id' => 1],
                ['project_id' => 2, 'student_id' => 2],
            ]);

            Evaluator::insert([
                ['PIN' => 1111, 'user_id' => 2, 'area' => AreaEnum::SCIENTIFIC],
                ['PIN' => 2222, 'user_id' => 3, 'area' => AreaEnum::TECHNICAL],
            ]);

            Question::insert([
                ['text' => 'Qual é a inovação do projeto?', 'type' => QuestionTypeEnum::MULTIPLE_CHOICE, 'area' => AreaEnum::SCIENTIFIC],
                ['text' => 'Forneça comentários detalhados.', 'type' => QuestionTypeEnum::TEXT, 'area' => AreaEnum::SCIENTIFIC],
                ['text' => 'De a nota da apresentação oral', 'type' => QuestionTypeEnum::MULTIPLE_CHOICE, 'area' => AreaEnum::SCIENTIFIC],
                ['text' => 'De a nota do banner I', 'type' => QuestionTypeEnum::MULTIPLE_CHOICE, 'area' => AreaEnum::SCIENTIFIC],
                ['text' => 'De a nota do banner II', 'type' => QuestionTypeEnum::MULTIPLE_CHOICE, 'area' => AreaEnum::SCIENTIFIC],
            ]);

            Assessment::insert([
                [ 'project_id' => 1, 'evaluator_id' => 2 ],
                [ 'project_id' => 2, 'evaluator_id' => 1 ],
            ]);

            Response::insert([
                [
                    'question_id' => 3,
                    'assessment_id' => 1,
                    'response' => null,
                    'score' => 8,
                ],
                [
                    'question_id' => 3,
                    'assessment_id' => 2,
                    'response' => null,
                    'score' => 5,
                ],
            ]);

            Award::insert([
                ['name' => 'Apresentação Oral', 'school_grade_id' => $elementarySchool->id],
                ['name' => 'Melhor Banner', 'school_grade_id' => $elementarySchool->id],
            ]);

            DB::table('award_question')->insert([
                ['award_id' => 1, 'question_id' => 3, 'weight' => 10],
                ['award_id' => 2, 'question_id' => 4, 'weight' => 5],
                ['award_id' => 2, 'question_id' => 5, 'weight' => 5],
            ]);
        }

        User::factory()->create([
            'name' => 'Rogério Alves dos Santos Antoniassi',
            'email' => 'rogerio.antoniassi@ifms.edu.br',
            'password' => bcrypt('R8$hG7@fK4jLp9#Qw1Z!uV2'),
        ]);
        
        User::factory()->create([
            'name' => 'Alex Fernando de Araujo',
            'email' => 'alex.araujo@ifms.edu.br',
            'password' => bcrypt('m5^Tz8*QrW3&yJ0@bC6!xL7'),
        ]);
    }
}
