<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AssessmentResource\Pages;
use App\Filament\Resources\AssessmentResource\RelationManagers;
use App\Helper;
use App\Models\Assessment;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class AssessmentResource extends Resource
{
    protected static ?string $model = Assessment::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $modelLabel = 'avaliação';

    protected static ?string $pluralLabel = 'avaliações';

    public static function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('evaluator.user.name')
                    ->label('Avaliador')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('project.external_id')
                    ->label('ID do Projeto')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('project.title')
                    ->label('Projeto')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('project.students.name')
                    ->label('Estudante')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('note')
                    ->label('Nota Final')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Criado em')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Atualizado em')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->whereHas('responses');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAssessments::route('/'),
            'create' => Pages\CreateAssessment::route('/create'),
            'view' => Pages\ViewAssessment::route('/{record}'),
            'edit' => Pages\EditAssessment::route('/{record}/edit'),
        ];
    }
}
