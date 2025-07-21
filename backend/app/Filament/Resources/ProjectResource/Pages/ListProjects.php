<?php

namespace App\Filament\Resources\ProjectResource\Pages;

use App\Filament\Imports\ProjectImporter;
use App\Filament\Resources\ProjectResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListProjects extends ListRecords
{
    protected static string $resource = ProjectResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ImportAction::make()
                ->importer(ProjectImporter::class)
                ->label('Importar projetos'),
            Actions\CreateAction::make(),
        ];
    }
}
