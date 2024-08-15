<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\Category;
use App\Models\Project;
use App\Models\Evaluator;
use App\Models\Question;
use App\Models\Response;
use App\Models\Award;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {

        // Inserir dados na tabela students
        Student::insert([
            ['name' => 'Ana Souza', 'email' => 'ana.souza@example.com'],
            ['name' => 'Carlos Silva', 'email' => 'carlos.silva@example.com'],
        ]);

        // Inserir dados na tabela categories
        Category::insert([
            ['name' => 'Tecnologia'],
            ['name' => 'Ciências'],
        ]);

        // Inserir dados na tabela projects
        Project::insert([
            [
                'title' => 'Pesquisa em IA',
                'qr_code' => 'QR1234',
                'description' => 'Um projeto sobre inteligência artificial.',
                'year' => 2024,
                'student_id' => 1,
                'category_id' => 1,
            ],
            [
                'title' => 'Computação Quântica',
                'qr_code' => 'QR5678',
                'description' => 'Um projeto explorando conceitos de computação quântica.',
                'year' => 2024,
                'student_id' => 2,
                'category_id' => 2,
            ],
        ]);

        // Inserir dados na tabela evaluators
        Evaluator::insert([
            ['name' => 'Dra. Juliana Costa', 'email' => 'juliana.costa@example.com', 'PIN' => 1111],
            ['name' => 'Prof. João Pereira', 'email' => 'joao.pereira@example.com', 'PIN' => 2222],
        ]);

        // Inserir dados na tabela questions
        Question::insert([
            ['text' => 'Qual é a inovação do projeto?', 'type' => 2],
            ['text' => 'Forneça comentários detalhados.', 'type' => 1],
        ]);

        // Inserir dados na tabela responses
        Response::insert([
            [
                'evaluator_id' => 1,
                'project_id' => 1,
                'question_id' => 1,
                'response' => 'Muito inovador',
                'score' => 9,
            ],
            [
                'evaluator_id' => 2,
                'project_id' => 2,
                'question_id' => 2,
                'response' => 'Excelente trabalho!',
                'score' => 10,
            ],
        ]);

        // Inserir dados na tabela awards
        Award::insert([
            ['name' => 'Melhor Inovação'],
            ['name' => 'Desempenho Excepcional'],
        ]);

        // Inserir dados na tabela award_question (tabela pivô)
        DB::table('award_question')->insert([
            ['award_id' => 1, 'question_id' => 1, 'weight' => 10],
            ['award_id' => 2, 'question_id' => 2, 'weight' => 5],
        ]);
    }
}
