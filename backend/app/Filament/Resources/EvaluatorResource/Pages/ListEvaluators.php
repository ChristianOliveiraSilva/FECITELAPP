<?php

namespace App\Filament\Resources\EvaluatorResource\Pages;

use App\Filament\Resources\EvaluatorResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListEvaluators extends ListRecords
{
    protected static string $resource = EvaluatorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
