<?php

namespace Database\Seeders;

use App\Models\School;
use Illuminate\Database\Seeder;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        School::insert([
            [
                'name' => 'Instituto Federal de Mato Grosso do Sul',
                'city' => 'Três Lagoas',
                'state' => 'MS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Escola Estadual Afonso Pena',
                'city' => 'Três Lagoas',
                'state' => 'MS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Escola Estadual João Magiano Pinto (JOMAP)',
                'city' => 'Três Lagoas',
                'state' => 'MS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Escola Estadual Luiz Lopes de Carvalho',
                'city' => 'Três Lagoas',
                'state' => 'MS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Escola Estadual Fernando Corrêa da Costa',
                'city' => 'Três Lagoas',
                'state' => 'MS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Escola Municipal Parque São Carlos',
                'city' => 'Três Lagoas',
                'state' => 'MS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Escola Municipal Elma Garcia Lata Batista',
                'city' => 'Três Lagoas',
                'state' => 'MS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Colégio SESI Três Lagoas',
                'city' => 'Três Lagoas',
                'state' => 'MS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Colégio Anglo Três Lagoas',
                'city' => 'Três Lagoas',
                'state' => 'MS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Colégio Objetivo Três Lagoas',
                'city' => 'Três Lagoas',
                'state' => 'MS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Colégio Dom Bosco',
                'city' => 'Três Lagoas',
                'state' => 'MS',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
