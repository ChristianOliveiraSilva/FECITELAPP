<?php

namespace App\Filament\Imports;

use App\Models\School;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;

class SchoolImporter extends Importer
{
    protected static ?string $model = School::class;

    public static function getModelLabel(): string
    {
        return 'escola';
    }

    public static function getColumns(): array
    {
        return [
            ImportColumn::make('name')
                ->requiredMapping()
                ->rules(['required'])
                ->cast('string')
                ->requiredMapping(),
            ImportColumn::make('city')
                ->rules(['nullable'])
                ->cast('string')
                ->nullable(),
            ImportColumn::make('state')
                ->rules(['nullable'])
                ->cast('string')
                ->nullable(),
        ];
    }

    public function resolveRecord(): ?School
    {
        return new School();
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        $body = 'A importação das suas escolas foi concluída e ' . number_format($import->successful_rows) . ' ' . str('row')->plural($import->successful_rows) . ' importadas.';

        if ($failedRowsCount = $import->getFailedRowsCount()) {
            $body .= ' ' . number_format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' falharam ao importar.';
        }

        return $body;
    }
} 