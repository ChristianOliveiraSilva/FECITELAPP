<?php

namespace App\Filament\Resources\CategoryResource\Pages;

use App\Filament\Imports\CategoryImporter;
use App\Filament\Resources\CategoryResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Filament\Resources\Components\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListCategories extends ListRecords
{
    protected static string $resource = CategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ImportAction::make()
                ->importer(CategoryImporter::class),
            Actions\CreateAction::make(),
        ];
    }
 
    public function getTabs(): array
    {
        return [
            'main' => Tab::make('Principais')
                ->modifyQueryUsing(fn (Builder $query) => $query->whereNull('main_category_id')),
            'all' => Tab::make('Todos'),
            'subs' => Tab::make('Sub-Categorias')
                ->modifyQueryUsing(fn (Builder $query) => $query->whereNotNull('main_category_id')),
        ];
    }
}
