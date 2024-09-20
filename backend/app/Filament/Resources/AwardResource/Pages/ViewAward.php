<?php

namespace App\Filament\Resources\AwardResource\Pages;

use App\Filament\Resources\AwardResource;
use Filament\Actions;
use Filament\Infolists\Components\Grid;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;

class ViewAward extends ViewRecord
{
    protected static string $resource = AwardResource::class;


    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Section::make('Dados do Aluno')
                ->schema([
                    TextEntry::make('name')
                        ->label('Prêmio'),
                    TextEntry::make('winner')
                        ->label('Ganhador'),
                    TextEntry::make('winner_score')
                        ->label('Nota'),
                ])
                ->columns(3)
                ->columnSpanFull()
            ]);
    }
}
