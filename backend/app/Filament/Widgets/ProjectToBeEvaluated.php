<?php

namespace App\Filament\Widgets;

use App\Models\Assessment;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ProjectToBeEvaluated extends BaseWidget
{
    protected function getStats(): array
    {
        $value = Assessment::all()->filter(fn($item) => !$item->has_response)->count();
        
        return [
            Stat::make('Total de trabalhos a serem avaliados', $value),
        ];
    }
}
