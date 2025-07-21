<?php

namespace App\Filament\Imports;

use App\Models\Project;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;

class ProjectImporter extends Importer
{
    protected static ?string $model = Project::class;

    public static function getModelLabel(): string
    {
        return 'projeto';
    }

    public static function getColumns(): array
    {
        return [
            ImportColumn::make('title')
                ->requiredMapping()
                ->rules(['required'])
                ->cast('string')
                ->requiredMapping(),
            ImportColumn::make('description')
                ->rules(['nullable'])
                ->cast('string')
                ->nullable(),
            ImportColumn::make('year')
                ->numeric()
                ->rules(['required', 'integer', 'min:1900', 'max:2100'])
                ->cast('integer')
                ->requiredMapping(),
            ImportColumn::make('projectType')
                ->numeric()
                ->rules(['required', 'integer', 'in:1,2'])
                ->helperText('1 = Tecnológico, 2 = Científico')
                ->cast('integer')
                ->requiredMapping(),
            ImportColumn::make('category_id')
                ->numeric()
                ->rules(['required', 'integer', 'exists:categories,id'])
                ->cast('integer')
                ->requiredMapping(),
            ImportColumn::make('external_id')
                ->numeric()
                ->rules(['required', 'integer', 'unique:projects,external_id'])
                ->cast('integer')
                ->requiredMapping(),
        ];
    }

    public function resolveRecord(): ?Project
    {
        return new Project();
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        $body = 'A importação dos seus projetos foi concluída e ' . number_format($import->successful_rows) . ' ' . str('row')->plural($import->successful_rows) . ' importadas.';

        if ($failedRowsCount = $import->getFailedRowsCount()) {
            $body .= ' ' . number_format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' falharam ao importar.';
        }

        return $body;
    }
} 