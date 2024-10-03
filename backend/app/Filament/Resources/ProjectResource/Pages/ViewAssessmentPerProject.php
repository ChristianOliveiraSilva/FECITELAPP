<?php

namespace App\Filament\Resources\ProjectResource\Pages;

use App\Filament\Resources\ProjectResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewAssessmentPerProject extends ViewRecord
{
    protected static string $resource = ProjectResource::class;

    public function getRelationManagers(): array
    {
        return [
            RelationManagers\AssessmentRelationManager::class,
        ];
    }
}
