<?php

namespace App\Filament\Widgets;

use App\Models\Assessment;
use App\Models\Project;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class MissingEvaluations extends BaseWidget
{
    protected function getStats(): array
    {
        $project1 = Project::whereHas('assessments', function($query) {
            $query->has('responses', '=', 1);
        })->count();
    
        $project2 = Project::whereHas('assessments', function($query) {
            $query->has('responses', '=', 2);
        })->count();
    
        $project3 = Project::whereHas('assessments', function($query) {
            $query->has('responses', '=', 3);
        })->count();
    
        return [
            Stat::make('Trabalhos que faltam 1 avaliação', $project1)
                ->extraAttributes([
                    'class' => 'mb-5 mt-6',
                ]),
            Stat::make('Trabalhos que faltam 2 avaliações', $project2)
                ->extraAttributes([
                    'class' => 'mb-5 mt-6',
                ]),
            Stat::make('Trabalhos que faltam 3 avaliações', $project3)
                ->extraAttributes([
                    'class' => 'mb-5 mt-6',
                ]),
        ];
    }
    
}
