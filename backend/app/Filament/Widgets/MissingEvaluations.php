<?php

namespace App\Filament\Widgets;

use App\Helper;
use App\Models\Assessment;
use App\Models\Project;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class MissingEvaluations extends BaseWidget
{
    protected function getStats(): array
    {
        $max = Helper::getMinimumNumberAssessmentsPerProject();
        
        $project1 = Project::whereHas('assessments', function ($query) {
            $query->has('responses');
        }, '=', $max - 1)->count();

        $project2 = Project::whereHas('assessments', function ($query) {
            $query->has('responses');
        }, '=', $max - 2)->count();

        $project3 = Project::whereHas('assessments', function ($query) {
            $query->has('responses');
        }, '=', $max - 3)->count();

        return [
            Stat::make('Trabalhos que faltam 1 avaliação', $project1)
                ->extraAttributes([
                    'id' => 'widget-success',
                    'class' => 'mb-5 mt-6', // Cor de fundo success
                ]),
            Stat::make('Trabalhos que faltam 2 avaliações', $project2)
                ->extraAttributes([
                    'id' => 'widget-warning',
                    'class' => 'mb-5 mt-6', // Cor de fundo warning
                ]),
            Stat::make('Trabalhos que faltam 3 avaliações', $project3)
                ->extraAttributes([
                    'id' => 'widget-danger',
                    'class' => 'mb-5 mt-6', // Cor de fundo danger
                ]),
        ];
    }
    
}
