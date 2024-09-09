<?php

namespace Database\Seeders;

use App\Models\SchoolGrade;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SchoolGradeSeeder extends Seeder
{
    public function run(): void
    {
        SchoolGrade::insert([
            ['name' => 'Ensino Fundamental'],
            ['name' => 'Ensino médio'],
            ['name' => 'Ensino Superior'],
        ]);
    }
}
