<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;

class EditalFecitelWidget extends Widget
{
    protected static string $view = 'filament.widgets.edital-fecitel-widget';

    protected int | string | array $columnSpan = 1;

    protected static ?int $sort = 1;
} 