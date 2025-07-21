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
        $users = User::factory()->count(5)->create([
            'active' => true,
        ]);

        $evaluators = [];
        foreach ($users as $user) {
            $evaluators[] = Evaluator::create([
                'PIN' => rand(1000, 9999),
                'user_id' => $user->id,
            ]);
        }

        $schools = School::all();
        
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

        $categories = Category::all();
        
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

        foreach ($projects as $project) {
            $projectStudents = fake()->randomElements($students, fake()->numberBetween(1, 3));
            $project->students()->attach(collect($projectStudents)->pluck('id'));
        }

        $evaluatorProjectCount = [];
        
        foreach ($projects as $project) {
            $availableEvaluators = array_filter($evaluators, function($evaluator) use ($evaluatorProjectCount) {
                return ($evaluatorProjectCount[$evaluator->id] ?? 0) < 3;
            });
            
            if (empty($availableEvaluators)) {
                break;
            }
            
            $projectEvaluators = fake()->randomElements($availableEvaluators, fake()->numberBetween(1, min(3, count($availableEvaluators))));
            
            foreach ($projectEvaluators as $evaluator) {
                Assessment::create([
                    'evaluator_id' => $evaluator->id,
                    'project_id' => $project->id,
                ]);
                
                $evaluatorProjectCount[$evaluator->id] = ($evaluatorProjectCount[$evaluator->id] ?? 0) + 1;
            }
        }

        $mainCategories = Category::whereNull('main_category_id')->take(5)->get();
        
        foreach ($evaluators as $evaluator) {
            $randomCategory = fake()->randomElement($mainCategories);
            $evaluator->categories()->attach([$randomCategory->id]);
        }
    }
} 