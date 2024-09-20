<?php

namespace App\Filament\Resources;

use App\Enum\AreaEnum;
use App\Filament\Resources\EvaluatorResource\Pages;
use App\Filament\Resources\EvaluatorResource\RelationManagers;
use App\Models\Evaluator;
use App\Models\Project;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class EvaluatorResource extends Resource
{
    protected static ?string $model = Evaluator::class;

    protected static ?string $navigationIcon = 'heroicon-s-eye';

    protected static ?string $modelLabel = 'avaliador';

    protected static ?string $pluralLabel = 'avaliadores';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Nome')
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('email')
                    ->label('Email')
                    ->email()
                    ->unique(ignoreRecord: true)
                    ->required()
                    ->maxLength(255),

                Forms\Components\TextInput::make('PIN')
                    ->label('PIN')
                    ->numeric()
                    ->unique(ignoreRecord: true)
                    ->default(Evaluator::generateRandomPin())
                    ->required(),

                Forms\Components\Select::make('area')
                    ->label('Área')
                    ->options(AreaEnum::class)
                    ->default(AreaEnum::TECHNICAL)
                    ->required(),

                Forms\Components\Select::make('project_id')
                    ->label('Projetos')
                    ->options(Project::all()->pluck('title', 'id'))
                    ->multiple()
                    ->preload()
                    ->required()
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Nome')
                    ->searchable(),
                Tables\Columns\TextColumn::make('user.email')
                    ->label('Email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('PIN')
                    ->label('PIN')
                    ->sortable(),
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
                //
            ])
            ->actions([
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

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEvaluators::route('/'),
            'create' => Pages\CreateEvaluator::route('/create'),
            'edit' => Pages\EditEvaluator::route('/{record}/edit'),
        ];
    }
}
