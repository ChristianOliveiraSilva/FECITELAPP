<?php

namespace App\Filament\Resources\EvaluatorResource\Pages;

use App\Filament\Resources\EvaluatorResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditEvaluator extends EditRecord
{
    protected static string $resource = EvaluatorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
