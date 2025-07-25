<?php

namespace App\Filament\Resources\CategoryResource\Pages;

use App\Filament\Resources\CategoryResource;
use App\Filament\Resources\CategoryResource\Pages\RelationManagers;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewCategory extends ViewRecord
{
    protected static string $resource = CategoryResource::class;

    public function getRelationManagers(): array
    {
        return [
            RelationManagers\SubCategoryRelationManager::class,
        ];
    }
}
