<?php

namespace App\Filament\Resources\EvaluatorResource\Pages;

use App\Filament\Imports\EvaluatorImporter;
use App\Filament\Resources\EvaluatorResource;
use App\Models\Assessment;
use App\Models\User;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateEvaluator extends CreateRecord
{
    protected static string $resource = EvaluatorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ImportAction::make()
                ->importer(EvaluatorImporter::class)
                ->label('Importar avaliadores'),
        ];
    }

    protected function handleRecordCreation(array $data): Model
    {
        $user = User::create([
            'email' => $data['email'],
            'name' => $data['name'],
            'password' => bcrypt('1234'),
            'active' => $data['active'],
        ]);
    
        $data['user_id'] = $user->id;
    
        $evaluator = static::getModel()::create($data);
    
        if (isset($data['project_id'])) {
            foreach ($data['project_id'] as $projectId) {
                Assessment::create([
                    'evaluator_id' => $evaluator->id,
                    'project_id' => $projectId,
                ]);
            }
        }
    
        return $evaluator;
    }
}
