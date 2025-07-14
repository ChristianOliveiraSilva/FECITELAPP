<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Filament\Resources\UserResource\RelationManagers;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use App\Helper;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-s-cog';

    protected static ?string $modelLabel = 'usuário do sistema';

    protected static ?string $pluralLabel = 'usuários do sistema';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Nome')
                    ->required(),

                Forms\Components\TextInput::make('email')
                    ->email()
                    ->unique(ignoreRecord: true),

                Forms\Components\TextInput::make('password')
                    ->password()
                    ->required(),

                Forms\Components\Toggle::make('active')
                    ->label('Ativo')
                    ->default(true)
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

                Tables\Columns\TextColumn::make('email_verified_at')
                    ->label('Email verificado')
                    ->dateTime()
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),

                Tables\Columns\IconColumn::make('active')
                    ->label('Ativo')
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
                    
                Tables\Columns\TextColumn::make('deleted_at')
                    ->label('Deletado em')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('active')
                    ->label('Status')
                    ->placeholder('Todos os usuários')
                    ->trueLabel('Apenas ativos')
                    ->falseLabel('Apenas inativos')
                    ->default(true),
            ])
            ->actions([
                Tables\Actions\Action::make('activate')
                    ->label('Ativar')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => !$record->active)
                    ->action(function ($record) {
                        $record->update(['active' => true]);
                    })
                    ->requiresConfirmation(),
                Tables\Actions\Action::make('deactivate')
                    ->label('Desativar')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn ($record) => $record->active)
                    ->action(function ($record) {
                        $record->update(['active' => false]);
                    })
                    ->requiresConfirmation(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('activate')
                        ->label('Ativar')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->action(function ($records) {
                            $records->each(function ($record) {
                                $record->update(['active' => true]);
                            });
                        })
                        ->requiresConfirmation(),
                    Tables\Actions\BulkAction::make('deactivate')
                        ->label('Desativar')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->action(function ($records) {
                            $records->each(function ($record) {
                                $record->update(['active' => false]);
                            });
                        })
                        ->requiresConfirmation(),
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
        return parent::getEloquentQuery()->whereDoesntHave('evaluator');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
