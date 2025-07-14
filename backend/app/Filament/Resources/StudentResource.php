<?php

namespace App\Filament\Resources;

use App\Enum\SchoolGradeEnum;
use App\Filament\Resources\StudentResource\Pages;
use App\Filament\Resources\StudentResource\RelationManagers;
use App\Models\Student;
use Filament\Forms;
use App\Helper;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class StudentResource extends Resource
{
    protected static ?string $model = Student::class;

    protected static ?string $navigationIcon = 'heroicon-s-users';

    protected static ?string $modelLabel = 'estudante';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Nome')
                    ->required(),

                Forms\Components\TextInput::make('email')
                    ->label('E-mail')
                    ->autocomplete(false)
                    ->email()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),

                Forms\Components\Select::make('school_id')
                    ->relationship('school', 'name')
                    ->label('Escola')
                    ->searchable()
                    ->preload()
                    ->required(),

                Forms\Components\Select::make('school_grade')
                    ->options(SchoolGradeEnum::getValues())
                    ->label('Grau de escolaridade')
                    ->required(),
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
                Tables\Columns\TextColumn::make('email')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('school_grade')
                    ->label('Grau de escolaridade')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('school.name')
                    ->label('Escola')
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
                //
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

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListStudents::route('/'),
            'create' => Pages\CreateStudent::route('/create'),
            'view' => Pages\ViewStudent::route('/{record}'),
            'edit' => Pages\EditStudent::route('/{record}/edit'),
        ];
    }
}
