<?php

namespace App\Filament\Widgets;

use App\Models\Assessment;
use App\Models\Project;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class EvaluatedProjects extends BaseWidget
{
    protected function getStats(): array
    {
        $value1 = Assessment::all()->filter(fn($item) => $item->has_response)->count();
        $value2 = Assessment::all()->filter(fn($item) => !$item->has_response)->count();
        $projects = Project::count();

        return [
            Stat::make('Total de trabalhos avaliados', $value1),
            Stat::make('Total de trabalhos a serem avaliados', $value2),
            Stat::make('Total de projetos', $projects),
        ];
    }
}
