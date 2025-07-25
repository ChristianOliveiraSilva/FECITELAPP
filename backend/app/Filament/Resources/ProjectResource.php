<?php

namespace App\Filament\Resources;

use App\Enum\ProjectTypeEnum;
use App\Filament\Resources\ProjectResource\Pages;
use App\Filament\Resources\ProjectResource\RelationManagers;
use App\Helper;
use App\Models\Category;
use App\Models\Project;
use App\Enum\SchoolGradeEnum;
use Filament\Forms;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ProjectResource extends Resource
{
    protected static ?string $model = Project::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-arrow-down';

    protected static ?string $modelLabel = 'projeto';

    protected static ?string $navigationGroup = 'Gestão de Projetos';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('title')
                    ->label('Título')
                    ->required(),

                Forms\Components\TextInput::make('external_id')
                    ->label('ID do projeto')
                    ->helperText('Este é um ID externo fornecido pela organização da FECITEL.')
                    ->required(),

                Forms\Components\Textarea::make('description')
                    ->label('Descrição')
                    ->columnSpanFull(),

                Forms\Components\TextInput::make('year')
                    ->label('Ano')
                    ->default(date('Y'))
                    ->numeric(),

                Forms\Components\Select::make('projectType')
                    ->label('Tipo de projeto')
                    ->options(ProjectTypeEnum::class)
                    ->default(ProjectTypeEnum::TECHNICAL)
                    ->required(),

                Forms\Components\Select::make('category_id')
                    ->label('Área')
                    ->relationship('category', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),

                Forms\Components\Select::make('students')
                    ->label('Estudantes')
                    ->relationship('students', 'name')
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
                Tables\Columns\TextColumn::make('external_id')
                    ->label('ID do projeto')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('title')
                    ->label('Título')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('year')
                    ->label('Ano')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('students.name')
                    ->label('Estudantes')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('category.name')
                    ->label('Área')
                    ->limit(50)
                    ->tooltip(Helper::getTooltipFunction())
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('projectType')
                    ->label('Tipo de projeto')
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
                SelectFilter::make('category')
                    ->label('Área')
                    ->relationship('category', 'name', fn (Builder $query) => $query->whereNull('main_category_id'))
                    ->searchable()
                    ->preload(),
                SelectFilter::make('students.school_grade')
                    ->label('Grau de escolaridade')
                    ->options(SchoolGradeEnum::getValues())
                    ->searchable()
                    ->preload(),
                SelectFilter::make('students.school')
                    ->label('Escola')
                    ->relationship('students.school', 'name')
                    ->searchable()
                    ->preload(),
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
            'index' => Pages\ListProjects::route('/'),
            'create' => Pages\CreateProject::route('/create'),
            'view-contact' => Pages\ViewAssessmentPerProject::route('/{record}/assessment'),
            'edit' => Pages\EditProject::route('/{record}/edit'),
        ];
    }
}
