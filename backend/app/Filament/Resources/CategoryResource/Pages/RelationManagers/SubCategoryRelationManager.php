<?php

namespace App\Filament\Resources\CategoryResource\Pages\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SubCategoryRelationManager extends RelationManager
{
    protected static string $relationship = 'subCategories';

    protected static ?string $title = 'Sub-Áreas';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('title')
            ->columns([
                TextColumn::make('name')->label('Nome'),
            ])
            ->filters([
                //
            ]);
    }
}
