<?php

namespace App\Filament\Resources\StudentResource\Pages\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProjectRelationManager extends RelationManager
{
    protected static string $relationship = 'projects';

    protected static ?string $title = 'Projetos';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('title')
            ->columns([
                TextColumn::make('title')->label('Título'),
                TextColumn::make('description')->label('Descrição'),
                TextColumn::make('year')->label('ano'),
                TextColumn::make('category.name')->label('Categoria'),
                TextColumn::make('area')->label('Tipo de projeto'),
            ])
            ->filters([
                //
            ]);
    }
}
