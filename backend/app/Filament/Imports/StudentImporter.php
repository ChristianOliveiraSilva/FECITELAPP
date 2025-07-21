<?php

namespace App\Filament\Imports;

use App\Models\Student;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;

class StudentImporter extends Importer
{
    protected static ?string $model = Student::class;

    public static function getModelLabel(): string
    {
        return 'estudante';
    }

    public static function getColumns(): array
    {
        return [
            ImportColumn::make('name')
                ->requiredMapping()
                ->rules(['required'])
                ->cast('string')
                ->requiredMapping(),
            ImportColumn::make('email')
                ->rules(['nullable', 'email', 'unique:students,email'])
                ->helperText('Email opcional do estudante')
                ->cast('string')
                ->nullable(),
            ImportColumn::make('school_id')
                ->numeric()
                ->rules(['required', 'integer', 'exists:schools,id'])
                ->helperText('ID da escola onde o estudante estuda')
                ->cast('integer')
                ->requiredMapping(),
            ImportColumn::make('school_grade')
                ->rules(['required', 'in:fundamental,medio,superior'])
                ->helperText('Grau de escolaridade: fundamental, medio, superior')
                ->cast('string')
                ->requiredMapping(),
        ];
    }

    public function resolveRecord(): ?Student
    {
        return new Student();
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        $body = 'A importação dos seus estudantes foi concluída e ' . number_format($import->successful_rows) . ' ' . str('row')->plural($import->successful_rows) . ' importadas.';

        if ($failedRowsCount = $import->getFailedRowsCount()) {
            $body .= ' ' . number_format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' falharam ao importar.';
        }

        return $body;
    }
} 