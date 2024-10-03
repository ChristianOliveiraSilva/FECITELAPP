<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\Evaluator;
use App\Models\Project;
use App\Models\SchoolGrade;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RealSeeder extends Seeder
{
    public function run(): void
    {
        echo "salvando os avaliadores" . PHP_EOL;
        $evaluators = json_decode(file_get_contents('./database/seeders/data/avaliadores.json'));

        foreach ($evaluators as $evaluator) {
            $this->saveEvaluator($evaluator);
        };

        echo "salvando os projetos e estudantes" . PHP_EOL;

        $data = json_decode(file_get_contents('./database/seeders/data/dados.json'));

        foreach ($data->data as $value) {
            $this->saveRow($value);
        };
    }


    private function saveEvaluator($evaluator): void
    {
        $user = User::where('name', $evaluator->name)->first();

        if (!$user) {
            $user = User::create([
                'name' => $evaluator->name,
            ]);
        }
        
        Evaluator::firstOrCreate([
            'user_id' => $user->id,
        ],[
            'PIN' => Evaluator::generateRandomPin(),
        ]);
    }

    private function saveRow($row): void
    {
        $project = Project::create([
            'title' => $row->title,
            'description' => '',
            'year' => date('Y'),
            'category_id' => $row->category_id,
            'area' => $row->area,
            'external_id' => $row->external_id,
        ]);

        foreach ($row->students as $student) {
            $s = Student::firstOrCreate([
                'name' => $student->name,
            ],[
                'email' => $student->email,
                'school_grade_id' => $row->grau_escolar,
                'school' => $row->escola,
            ]);

            $project->students()->attach($s->id);
        }

        Assessment::create([
            'evaluator_id' => $row->evaluator1_id,
            'project_id' => $project->id,
        ]);

        Assessment::create([
            'evaluator_id' => $row->evaluator2_id,
            'project_id' => $project->id,
        ]);

        Assessment::create([
            'evaluator_id' => $row->evaluator3_id,
            'project_id' => $project->id,
        ]);
    }
}
