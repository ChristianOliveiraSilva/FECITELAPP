<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AwardResource\Pages;
use App\Filament\Resources\AwardResource\RelationManagers;
use App\Models\Award;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use App\Helper;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class AwardResource extends Resource
{
    protected static ?string $model = Award::class;

    protected static ?string $navigationIcon = 'heroicon-o-trophy';

    protected static ?string $modelLabel = 'premiação';

    protected static ?string $pluralLabel = 'premiações';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Nome')
                    ->required(),

                Forms\Components\Select::make('school_grade_id')
                    ->relationship('schoolGrade', 'name')
                    ->label('Grau de Escolaridade')
                    ->required(),

                Forms\Components\Select::make('questions')
                    ->label('Perguntas')
                    ->relationship('questions', 'text')
                    ->multiple()
                    ->preload()
                    ->required(),

                Forms\Components\TextInput::make('total_positions')
                    ->label('Total de posições')
                    ->required(),

                Forms\Components\Checkbox::make('use_school_grades')
                    ->label('Usar Grau de escolaridade'),

                Forms\Components\Checkbox::make('use_categories')
                    ->label('Usar Áreas'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nome')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('schoolGrade.name')
                    ->label('Grau de Escolaridade')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('total_positions')
                    ->label('Total de posições')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),

                Tables\Columns\IconColumn::make('use_school_grades')
                    ->label('Usar Graus de escolaridade?')
                    ->boolean()
                    ->sortable()
                    ->searchable(),

                Tables\Columns\IconColumn::make('use_categories')
                    ->label('Usar Áreas?')
                    ->boolean()
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
                SelectFilter::make('schoolGrade')
                    ->relationship('schoolGrade', 'name')
                    ->label('Grau de Escolaridade')
                    ->searchable()
                    ->preload()
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
            'index' => Pages\ListAwards::route('/'),
            'create' => Pages\CreateAward::route('/create'),
            'edit' => Pages\EditAward::route('/{record}/edit'),
        ];
    }
}
