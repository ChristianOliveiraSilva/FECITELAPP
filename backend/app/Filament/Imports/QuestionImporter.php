<?php

namespace App\Filament\Imports;

use App\Models\Question;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;

class QuestionImporter extends Importer
{
    protected static ?string $model = Question::class;

    public static function getModelLabel(): string
    {
        return 'pergunta';
    }

    public static function getColumns(): array
    {
        return [
            ImportColumn::make('scientific_text')
                ->requiredMapping()
                ->rules(['required'])
                ->cast('string')
                ->requiredMapping(),
            ImportColumn::make('technological_text')
                ->requiredMapping()
                ->rules(['required'])
                ->cast('string')
                ->requiredMapping(),
            ImportColumn::make('type')
                ->numeric()
                ->rules(['required', 'integer', 'in:1,2'])
                ->helperText('1 = Questão de Múltipla Escolha, 2 = Questão de Texto')
                ->cast('integer')
                ->requiredMapping(),
            ImportColumn::make('number_alternatives')
                ->numeric()
                ->rules(['required', 'integer', 'min:1', 'max:50'])
                ->helperText('Número de alternativas para questões de múltipla escolha')
                ->cast('integer')
                ->requiredMapping(),
        ];
    }

    public function resolveRecord(): ?Question
    {
        return new Question();
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        $body = 'A importação das suas perguntas foi concluída e ' . number_format($import->successful_rows) . ' ' . str('row')->plural($import->successful_rows) . ' importadas.';

        if ($failedRowsCount = $import->getFailedRowsCount()) {
            $body .= ' ' . number_format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' falharam ao importar.';
        }

        return $body;
    }
} 