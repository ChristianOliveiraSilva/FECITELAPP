<?php

namespace App\Filament\Resources;


use App\Enum\QuestionTypeEnum;
use App\Filament\Resources\QuestionResource\Pages;
use App\Filament\Resources\QuestionResource\RelationManagers;
use App\Models\Question;
use App\Helper;
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

    protected static ?string $navigationGroup = 'Gestão de Projetos';

    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Textarea::make('scientific_text')
                    ->label('Texto Científico')
                    ->required()
                    ->columnSpanFull(),

                Forms\Components\Textarea::make('technological_text')
                    ->label('Texto Tecnológico')
                    ->required()
                    ->columnSpanFull(),

                Forms\Components\Select::make('type')
                    ->label('Tipo de Pergunta')
                    ->options(QuestionTypeEnum::class)
                    ->default(QuestionTypeEnum::MULTIPLE_CHOICE)
                    ->live()
                    ->required(),



                Forms\Components\TextInput::make('number_alternatives')
                    ->label('Número de Alternativas')
                    ->default(20)
                    ->numeric()
                    ->hidden(fn (Get $get) => self::setHiddenValue($get('type'), QuestionTypeEnum::MULTIPLE_CHOICE->value)),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('scientific_text')
                    ->label('Texto Científico')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('technological_text')
                    ->label('Texto Tecnológico')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Tipo')
                    ->limit(50)
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
                SelectFilter::make('type')
                    ->label('Tipo')
                    ->options(fn (): array => QuestionTypeEnum::getValues())
                    ->attribute('type'),

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

    public static function setHiddenValue($value, $enumValue): bool
    {
        if (is_integer($value) || is_string($value)) {
            return $value != $enumValue;
        }

        return $value->value != $enumValue;
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
