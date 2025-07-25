<?php

namespace App\Filament\Resources\QuestionResource\Pages;

use App\Filament\Imports\QuestionImporter;
use App\Filament\Resources\QuestionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListQuestions extends ListRecords
{
    protected static string $resource = QuestionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ImportAction::make()
                ->importer(QuestionImporter::class)
                ->label('Importar perguntas'),
            Actions\CreateAction::make(),
        ];
    }
}
