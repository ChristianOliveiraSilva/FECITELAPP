<?php

namespace App\Filament\Imports;

use App\Models\Evaluator;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;

class EvaluatorImporter extends Importer
{
    protected static ?string $model = Evaluator::class;

    public static function getModelLabel(): string
    {
        return 'avaliador';
    }

    public static function getColumns(): array
    {
        return [
            ImportColumn::make('PIN')
                ->numeric()
                ->rules(['nullable', 'integer', 'min:1000', 'max:9999', 'unique:evaluators,PIN'])
                ->helperText('PIN de 4 dígitos do avaliador (opcional)')
                ->cast('integer')
                ->nullable(),
            ImportColumn::make('user_id')
                ->numeric()
                ->rules(['nullable', 'integer', 'exists:users,id'])
                ->helperText('ID do usuário associado ao avaliador (opcional)')
                ->cast('integer')
                ->nullable(),
        ];
    }

    public function resolveRecord(): ?Evaluator
    {
        return new Evaluator();
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        $body = 'A importação dos seus avaliadores foi concluída e ' . number_format($import->successful_rows) . ' ' . str('row')->plural($import->successful_rows) . ' importadas.';

        if ($failedRowsCount = $import->getFailedRowsCount()) {
            $body .= ' ' . number_format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' falharam ao importar.';
        }

        return $body;
    }
} 