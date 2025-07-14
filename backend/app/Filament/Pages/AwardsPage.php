<?php

namespace App\Filament\Pages;

use App\Enum\SchoolGradeEnum;
use App\Models\Category;
use App\Models\Project;
use App\Models\Question;
use Filament\Pages\Page;

class AwardsPage extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static string $view = 'filament.pages.awards';

    protected static ?string $title = 'Resultados das Premiações';

    protected function getViewData(): array
    {
        $schoolGrades = collect(SchoolGradeEnum::cases())->map(function ($grade) {
            return (object) [
                'id' => $grade->value,
                'name' => $grade->getLabel(),
            ];
        });
        $categories = Category::mainCategories();
        $questions = Question::all();
        $projectQuery = Project::query();
        $question = null;

        $data = request()->all();
        
        if (!empty($data['school_grade'])) {
            $projectQuery->whereHas('students', function ($q) use ($data) {
                $q->where('school_grade', $data['school_grade']);
            });
        }
        
        if (!empty($data['category'])) {
            $projectQuery->where('category_id', $data['category']);
        }
        
        if (!empty($data['question'])) {
            $question = Question::find($data['question']);
        }

        $projects = $projectQuery->get();

        return [
            'schoolGrades' => $schoolGrades,
            'categories' => $categories,
            'questions' => $questions,
            'projects' => $projects,
            'question' => $question,
        ];
    }
}
