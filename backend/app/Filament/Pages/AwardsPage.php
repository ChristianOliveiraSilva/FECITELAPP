<?php

namespace App\Filament\Pages;

use App\Models\Award;
use Filament\Pages\Page;

class AwardsPage extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static string $view = 'filament.pages.awards';

    protected static ?string $title = 'Resultados das Premiações';

    protected function getViewData(): array
    {
        return [
            'awards' => Award::all(),
        ];
    }
}
