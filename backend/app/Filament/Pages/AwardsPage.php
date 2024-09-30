<?php

namespace App\Filament\Pages;

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
        $questions = Question::all();
        $projects = Project::all();

        $column = request('sort_column');
        $direction = request('sort_direction');

        if ($column && $direction) {
            $projects = $projects->sortBy(function ($project, int $key) {
                return $project->id;
            });
        }

        return [
            'questions' => $questions,
            'projects' => $projects,
        ];
    }
}
