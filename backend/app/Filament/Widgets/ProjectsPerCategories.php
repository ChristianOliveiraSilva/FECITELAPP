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
    protected static string $view = 'accordion-widget';

    protected function getViewData(): array
    {
        $values = Category::mainCategories()->map(function($category) {
            $totalProjects = $category->projects->count();
    
            $projectsWithAllAssessmentsResponded = $category->projects
                ->filter(fn($project) => $project->assessments->count() >= Helper::getMinimumNumberAssessmentsPerProject() &&
                                         $project->assessments->every(fn($assessment) => $assessment->has_response))
                ->count();
    
            $projectsWithPendingAssessments = $totalProjects - $projectsWithAllAssessmentsResponded;
    
            $category->totalProjects = $totalProjects;
            $category->projectsWithPendingAssessments = $projectsWithPendingAssessments;
            $category->projectsWithAllAssessmentsResponded = $projectsWithAllAssessmentsResponded;

            return $category;
        })->flatten()->toArray();

        return [
            'values' => $values
        ];
    }
}
