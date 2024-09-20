<?php

namespace App\Filament\Resources\AssessmentResource\Pages\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class NoteRelationManager extends RelationManager
{
    protected static string $relationship = 'responses';

    protected static ?string $title = 'Respostas';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('title')
            ->columns([
                TextColumn::make('question.text')->label('Pergunta'),
                TextColumn::make('response')->label('Resposta Textual'),
                TextColumn::make('score')->label('Resposta Numérica'),
            ])
            ->filters([
                //
            ]);
    }
}
