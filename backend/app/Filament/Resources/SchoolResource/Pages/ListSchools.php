<?php

namespace App\Filament\Resources\SchoolResource\Pages;

use App\Filament\Imports\SchoolImporter;
use App\Filament\Resources\SchoolResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListSchools extends ListRecords
{
    protected static string $resource = SchoolResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ImportAction::make()
                ->importer(SchoolImporter::class)
                ->label('Importar escolas'),
            Actions\CreateAction::make(),
        ];
    }
}
