<?php

namespace App\Filament\Resources\ProjectResource\Pages\RelationManagers;

use App\Filament\Resources\AssessmentResource\Pages\ViewAssessment;
use App\Filament\Resources\ProjectResource\Pages\EditProject;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Tables\Actions\Action;

class AssessmentRelationManager extends RelationManager
{
    protected static string $relationship = 'assessments';

    protected static ?string $title = 'Avaliações';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('evaluator.user.name')->label('Avaliador'),
                TextColumn::make('project.external_id')->label('ID do Projeto'),
                TextColumn::make('project.title')->label('Projeto'),
                TextColumn::make('note')->label('Nota'),
            ])
            ->actions([
                Action::make('link')
                    ->label('Ver Avaliação')
                    ->url(fn ($record): string => ViewAssessment::getNavigationUrl(['record' => $record->id])),
            ]);
    }
}
