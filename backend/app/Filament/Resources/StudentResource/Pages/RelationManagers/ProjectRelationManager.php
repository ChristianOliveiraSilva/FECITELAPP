<?php

namespace App\Filament\Resources\StudentResource\Pages\RelationManagers;

use App\Filament\Resources\ProjectResource\Pages\EditProject;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Tables\Actions\Action;

class ProjectRelationManager extends RelationManager
{
    protected static string $relationship = 'projects';

    protected static ?string $title = 'Projetos';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')->label('Título'),
                TextColumn::make('description')->label('Descrição'),
                TextColumn::make('year')->label('ano'),
                TextColumn::make('category.name')->label('Categoria'),
                TextColumn::make('projectType')->label('Tipo de projeto'),
            ])
            ->actions([
                Action::make('link')
                    ->label('Ver Projeto')
                    ->url(fn ($record): string => EditProject::getNavigationUrl(['record' => $record->id])),
            ]);
    }
}
