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

class AssessmentResource extends Resource
{
    protected static ?string $model = Assessment::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $modelLabel = 'avaliação';

    protected static ?string $pluralLabel = 'avaliações';

    protected static ?string $navigationGroup = 'Gestão de Projetos';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Informações da Avaliação')
                ->description('Configure os dados básicos da avaliação')
                ->schema([
                    Forms\Components\Select::make('evaluator_id')
                        ->label('Avaliador')
                        ->options(function () {
                            return \App\Models\Evaluator::with('user')
                                ->get()
                                ->mapWithKeys(function ($evaluator) {
                                    return [$evaluator->id => $evaluator->user->name ?? 'Avaliador #' . $evaluator->id];
                                });
                        })
                        ->searchable()
                        ->required()
                        ->placeholder('Selecione um avaliador')
                        ->helperText('Escolha o avaliador responsável por esta avaliação'),
                    
                    Forms\Components\Select::make('project_id')
                        ->label('Projeto')
                        ->options(function () {
                            return \App\Models\Project::with(['students', 'category'])
                                ->get()
                                ->mapWithKeys(function ($project) {
                                    $students = $project->students->pluck('name')->join(', ');
                                    $category = $project->category->name ?? 'Sem categoria';
                                    return [$project->id => "{$project->title} - {$students} ({$category})"];
                                });
                        })
                        ->searchable()
                        ->required()
                        ->placeholder('Selecione um projeto')
                        ->helperText('Escolha o projeto que será avaliado'),
                ])
                ->columns(2),
            
            Forms\Components\Section::make('Informações Adicionais')
                ->description('Dados sobre a avaliação')
                ->schema([
                    Forms\Components\Placeholder::make('created_at')
                        ->label('Data de Criação')
                        ->content(fn ($record) => $record ? $record->created_at->format('d/m/Y H:i:s') : 'N/A'),
                    
                    Forms\Components\Placeholder::make('updated_at')
                        ->label('Última Atualização')
                        ->content(fn ($record) => $record ? $record->updated_at->format('d/m/Y H:i:s') : 'N/A'),
                    
                    Forms\Components\Placeholder::make('has_response')
                        ->label('Possui Respostas')
                        ->content(fn ($record) => $record && $record->has_response ? 'Sim' : 'Não'),
                    
                    Forms\Components\Placeholder::make('note')
                        ->label('Nota Final')
                        ->content(fn ($record) => $record ? number_format($record->note, 2) : '0.00'),
                ])
                ->columns(2)
                ->visible(fn ($record) => $record !== null),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('evaluator.user.name')
                    ->label('Avaliador')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('project.external_id')
                    ->label('ID do Projeto')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('project.title')
                    ->label('Projeto')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
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
        return parent::getEloquentQuery();
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
