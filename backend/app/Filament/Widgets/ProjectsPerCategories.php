<?php

namespace App\Filament\Widgets;

use App\Helper;
use App\Models\Assessment;
use App\Models\Category;
use App\Models\Project;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ProjectsPerCategories extends BaseWidget
{
    
    protected function getStats(): array
    {
        return Category::mainCategories()->reverse()->map(function($category) {
            $totalProjects = $category->projects->count();
    
            // Projetos onde todas as assessments têm has_response = true
            $projectsWithAllAssessmentsResponded = $category->projects
                ->filter(fn($project) => $project->assessments->count() === Helper::getMinimumNumberAssessmentsPerProject() &&
                                         $project->assessments->every(fn($assessment) => $assessment->has_response))
                ->count();
    
            // Projetos com pelo menos uma assessment sem has_response
            $projectsWithPendingAssessments = $totalProjects - $projectsWithAllAssessmentsResponded;
    
            return [
                Stat::make('Total de projetos ' . $category->name, $totalProjects),
                Stat::make('Total de trabalhos a serem avaliados ' . $category->name, $projectsWithPendingAssessments),
                Stat::make('Total de trabalhos avaliados ' . $category->name, $projectsWithAllAssessmentsResponded),
            ];
        })->flatten()->toArray();
    }
}
