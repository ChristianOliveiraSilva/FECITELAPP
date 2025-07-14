<?php

namespace App\Filament\Resources\EvaluatorResource\Pages;

use App\Filament\Resources\EvaluatorResource;
use App\Models\Assessment;
use App\Models\Evaluator;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class EditEvaluator extends EditRecord
{
    protected static string $resource = EvaluatorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        $model = Evaluator::find($data['id']);

        $data['name'] = $model->user->name;
        $data['email'] = $model->user->email;
        $data['active'] = $model->user->active;
        $data['project_id'] = $model->assessments->pluck('project_id');
    
        return $data;
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        $record->user->name = $data['name'];
        $record->user->email = $data['email'];
        $record->user->active = $data['active'];
        $record->user->save();

        $record->update($data);
    
        if (isset($data['project_id'])) {
            Assessment::where('evaluator_id', $record->id)->delete();

            foreach ($data['project_id'] as $projectId) {
                Assessment::firstOrCreate([
                    'evaluator_id' => $record->id,
                    'project_id' => $projectId,
                ]);
            }
        }
    
        return $record;
    }
}
