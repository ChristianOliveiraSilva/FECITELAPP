<?php

namespace Database\Seeders;

use App\Models\Question;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    public function run()
    {
        $questions = [
            [
                'id' => 6,
                'scientific_text' => 'Problema/hipótese: delimitação do tema, relação hipótese/problema/objetivo; clareza na formulação; originalidade; relevância social.',
                'technological_text' => 'Problema/hipótese: delimitação do tema, relação hipótese/problema/objetivo; clareza na formulação; originalidade; relevância social.',
                'type' => 1,
                'number_alternatives' => 10,
                'created_at' => Carbon::parse('2024-10-02 13:24:44'),
                'updated_at' => Carbon::parse('2024-10-02 13:24:44'),
                'deleted_at' => null,
            ],
            [
                'id' => 7,
                'scientific_text' => 'Problema: definição clara do problema; alternativas de solução relacionando com teorias e conceitos científicos; originalidade; relevância social.',
                'technological_text' => 'Problema: definição clara do problema; alternativas de solução relacionando com teorias e conceitos tecnológicos; originalidade; relevância social.',
                'type' => 1,
                'number_alternatives' => 10,
                'created_at' => Carbon::parse('2024-10-02 13:25:22'),
                'updated_at' => Carbon::parse('2024-10-02 13:25:22'),
                'deleted_at' => null,
            ],
            [
                'id' => 8,
                'scientific_text' => 'Coleta de dados/metodologia: metodologia utilizada; seleção/aplicação de instrumentos de coleta; seleção da amostra (amostragem); análise e interpretação dos dados.',
                'technological_text' => 'Coleta de dados/metodologia: metodologia utilizada; seleção/aplicação de instrumentos de coleta; seleção da amostra (amostragem); análise e interpretação dos dados.',
                'type' => 1,
                'number_alternatives' => 10,
                'created_at' => Carbon::parse('2024-10-02 13:25:54'),
                'updated_at' => Carbon::parse('2024-10-02 13:25:54'),
                'deleted_at' => null,
            ],
            [
                'id' => 9,
                'scientific_text' => 'Elaboração do projeto/Metodologia: conhecimento científico; materiais e métodos; análises e interpretações de dados.',
                'technological_text' => 'Elaboração do projeto/Metodologia: conhecimento tecnológico; materiais e métodos; análises e interpretações de dados.',
                'type' => 1,
                'number_alternatives' => 10,
                'created_at' => Carbon::parse('2024-10-02 13:26:11'),
                'updated_at' => Carbon::parse('2024-10-02 13:26:11'),
                'deleted_at' => null,
            ],
        ];

        foreach ($questions as $question) {
            Question::create($question);
        }
    }
}
