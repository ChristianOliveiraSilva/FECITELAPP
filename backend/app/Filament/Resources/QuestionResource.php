<?php

namespace App\Filament\Resources;

use App\Enum\AreaEnum;
use App\Enum\QuestionTypeEnum;
use App\Filament\Resources\QuestionResource\Pages;
use App\Filament\Resources\QuestionResource\RelationManagers;
use App\Models\Question;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Tables\Columns\SelectColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;

class QuestionResource extends Resource
{
    protected static ?string $model = Question::class;

    protected static ?string $navigationIcon = 'heroicon-o-question-mark-circle';

    protected static ?string $modelLabel = 'pergunta';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Textarea::make('text')
                    ->label('Pergunta')
                    ->required()
                    ->columnSpanFull(),

                Forms\Components\Select::make('type')
                    ->label('Tipo')
                    ->options(QuestionTypeEnum::class)
                    ->default(QuestionTypeEnum::MULTIPLE_CHOICE)
                    ->live()
                    ->required(),

                Forms\Components\Select::make('area')
                    ->label('Tipo de projeto')
                    ->options(AreaEnum::class)
                    ->default(AreaEnum::TECHNICAL)
                    ->required(),

                Forms\Components\TextInput::make('number_alternatives')
                    ->label('Número de Alternativas')
                    ->default(20)
                    ->numeric()
                    ->hidden(fn (Get $get) => $get('type') != QuestionTypeEnum::MULTIPLE_CHOICE),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('text')
                    ->label('Pergunta')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Tipo')
                    ->limit(50)
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('area')
                    ->label('Tipo de projeto')
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
                SelectFilter::make('type')
                    ->label('Tipo')
                    ->options(fn (): array => QuestionTypeEnum::getValues())
                    ->attribute('type'),
                SelectFilter::make('area')
                    ->label('Tipo de projeto')
                    ->options(fn (): array => AreaEnum::getValues())
                    ->attribute('area'),
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
            'index' => Pages\ListQuestions::route('/'),
            'create' => Pages\CreateQuestion::route('/create'),
            'edit' => Pages\EditQuestion::route('/{record}/edit'),
        ];
    }
}
