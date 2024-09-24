<?php

namespace App\Filament\Widgets;

use App\Helper;
use App\Models\Assessment;
use App\Models\Project;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class EvaluatedProjects extends BaseWidget
{
    protected function getStats(): array
    {
        $totalProjects = Project::count();

        $projectsWithAllAssessmentsResponded = Project::with('assessments')
            ->get()
            ->filter(fn($project) => $project->assessments->count() === Helper::getMinimumNumberAssessmentsPerProject() && 
                                     $project->assessments->every(fn($assessment) => $assessment->has_response))
            ->count();

        $projectsWithPendingAssessments = $totalProjects - $projectsWithAllAssessmentsResponded;    
    
        return [
            Stat::make('Total de projetos', $totalProjects),
            Stat::make('Total de trabalhos a serem avaliados', $projectsWithPendingAssessments),
            Stat::make('Total de trabalhos avaliados', $projectsWithAllAssessmentsResponded),
        ];
    }
}
