<?php

namespace App\Filament\Imports;

use App\Models\Category;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;

class CategoryImporter extends Importer
{
    protected static ?string $model = Category::class;

    public static function getColumns(): array
    {
        return [
            ImportColumn::make('name')
                ->requiredMapping()
                ->rules(['required']),
            ImportColumn::make('main_category_id')
                ->numeric()
                ->rules(['integer']),
        ];
    }

    public function resolveRecord(): ?Category
    {
        // return Category::firstOrNew([
        //     // Update existing records, matching them by `$this->data['column_name']`
        //     'email' => $this->data['email'],
        // ]);

        return new Category();
    }

    public static function getCompletedNotificationBody(Import $import): string
    {
        $body = 'A importação da sua categoria foi concluída e ' . number_format($import->successful_rows) . ' ' . str('row')->plural($import->successful_rows) . ' importadas.';

        if ($failedRowsCount = $import->getFailedRowsCount()) {
            $body .= ' ' . number_format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' falharam ao importar.';
        }

        return $body;
    }
}
