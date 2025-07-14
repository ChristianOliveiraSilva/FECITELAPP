<?php

namespace Database\Seeders;

use App\Enum\ProjectTypeEnum;
use App\Enum\SchoolGradeEnum;
use App\Models\Assessment;
use App\Models\Category;
use App\Models\Evaluator;
use App\Models\Project;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        // Criar usuários de teste
        $users = User::factory()->count(5)->create([
            'active' => true,
        ]);

        // Criar avaliadores de teste
        $evaluators = [];
        foreach ($users as $user) {
            $evaluators[] = Evaluator::create([
                'PIN' => rand(1000, 9999),
                'user_id' => $user->id,
            ]);
        }

        // Buscar escolas existentes
        $schools = School::all();
        
        // Criar estudantes de teste
        $students = [];
        foreach ($schools as $school) {
            for ($i = 0; $i < 3; $i++) {
                $students[] = Student::create([
                    'name' => fake()->name(),
                    'email' => fake()->unique()->safeEmail(),
                    'school_id' => $school->id,
                    'school_grade' => fake()->randomElement([SchoolGradeEnum::FUNDAMENTAL->value, SchoolGradeEnum::MEDIO->value]),
                ]);
            }
        }

        // Buscar categorias existentes
        $categories = Category::all();
        
        // Criar projetos de teste
        $projects = [];
        foreach ($categories as $category) {
            for ($i = 0; $i < 2; $i++) {
                $projectType = fake()->randomElement(ProjectTypeEnum::cases())->value;
                
                $projects[] = Project::create([
                    'title' => fake()->sentence(3),
                    'description' => fake()->paragraph(),
                    'year' => fake()->numberBetween(2020, 2024),
                    'projectType' => $projectType,
                    'category_id' => $category->id,
                    'external_id' => fake()->unique()->numberBetween(1000, 9999),
                ]);
            }
        }

        // Associar estudantes aos projetos
        foreach ($projects as $project) {
            $projectStudents = fake()->randomElements($students, fake()->numberBetween(1, 3));
            $project->students()->attach(collect($projectStudents)->pluck('id'));
        }

        // Criar avaliações de teste (máximo 3 projetos por avaliador)
        $evaluatorProjectCount = [];
        
        foreach ($projects as $project) {
            // Filtrar avaliadores que ainda não atingiram o limite de 3 projetos
            $availableEvaluators = array_filter($evaluators, function($evaluator) use ($evaluatorProjectCount) {
                return ($evaluatorProjectCount[$evaluator->id] ?? 0) < 3;
            });
            
            if (empty($availableEvaluators)) {
                break; // Se não há avaliadores disponíveis, para de criar avaliações
            }
            
            $projectEvaluators = fake()->randomElements($availableEvaluators, fake()->numberBetween(1, min(3, count($availableEvaluators))));
            
            foreach ($projectEvaluators as $evaluator) {
                Assessment::create([
                    'evaluator_id' => $evaluator->id,
                    'project_id' => $project->id,
                ]);
                
                // Incrementar contador de projetos para este avaliador
                $evaluatorProjectCount[$evaluator->id] = ($evaluatorProjectCount[$evaluator->id] ?? 0) + 1;
            }
        }

        // Buscar apenas as categorias principais (5 primeiras)
        $mainCategories = Category::whereNull('main_category_id')->take(5)->get();
        
        // Associar uma categoria principal a cada avaliador
        foreach ($evaluators as $evaluator) {
            $randomCategory = fake()->randomElement($mainCategories);
            $evaluator->categories()->attach([$randomCategory->id]);
        }
    }
} 