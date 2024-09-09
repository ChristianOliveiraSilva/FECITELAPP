<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run()
    {
        // Categorias principais
        $mainCategories = [
            ['name' => 'CBS - Ciências Biológicas e da Saúde', 'main_category_id' => null],
            ['name' => 'CET - Ciências Exatas e da Terra', 'main_category_id' => null],
            ['name' => 'CHSAL - Ciências Humanas; Sociais Aplicadas e Linguística e Artes', 'main_category_id' => null],
            ['name' => 'CAE - Ciências Agrárias e Engenharias', 'main_category_id' => null],
            ['name' => 'MDIS - Multidisciplinar', 'main_category_id' => null],
        ];

        // Subcategorias
        $subCategories = [
            // CBS Subcategorias
            ['name' => 'Biologia Geral', 'main_category_id' => 1],
            ['name' => 'Genética', 'main_category_id' => 1],
            ['name' => 'Botânica', 'main_category_id' => 1],
            ['name' => 'Zoologia', 'main_category_id' => 1],
            ['name' => 'Ecologia', 'main_category_id' => 1],
            ['name' => 'Morfologia', 'main_category_id' => 1],
            ['name' => 'Fisiologia', 'main_category_id' => 1],
            ['name' => 'Bioquímica', 'main_category_id' => 1],
            ['name' => 'Biofísica', 'main_category_id' => 1],
            ['name' => 'Farmacologia', 'main_category_id' => 1],
            ['name' => 'Imunologia', 'main_category_id' => 1],
            ['name' => 'Microbiologia', 'main_category_id' => 1],
            ['name' => 'Parasitologia', 'main_category_id' => 1],
            ['name' => 'Medicina', 'main_category_id' => 1],
            ['name' => 'Odontologia', 'main_category_id' => 1],
            ['name' => 'Farmácia', 'main_category_id' => 1],
            ['name' => 'Enfermagem', 'main_category_id' => 1],
            ['name' => 'Nutrição', 'main_category_id' => 1],
            ['name' => 'Saúde Coletiva', 'main_category_id' => 1],
            ['name' => 'Fonoaudiologia', 'main_category_id' => 1],
            ['name' => 'Fisioterapia e Terapia Ocupacional', 'main_category_id' => 1],
            ['name' => 'Educação Física', 'main_category_id' => 1],

            // CET Subcategorias
            ['name' => 'Matemática', 'main_category_id' => 2],
            ['name' => 'Probabilidade e Estatística', 'main_category_id' => 2],
            ['name' => 'Ciência da Computação', 'main_category_id' => 2],
            ['name' => 'Astronomia', 'main_category_id' => 2],
            ['name' => 'Física', 'main_category_id' => 2],
            ['name' => 'Química', 'main_category_id' => 2],
            ['name' => 'GeoCiências', 'main_category_id' => 2],
            ['name' => 'Oceanografia', 'main_category_id' => 2],

            // CHSAL Subcategorias
            ['name' => 'Direito', 'main_category_id' => 3],
            ['name' => 'Administração', 'main_category_id' => 3],
            ['name' => 'Economia', 'main_category_id' => 3],
            ['name' => 'Arquitetura e Urbanismo', 'main_category_id' => 3],
            ['name' => 'Planejamento Urbano e Regional', 'main_category_id' => 3],
            ['name' => 'Demografia', 'main_category_id' => 3],
            ['name' => 'Ciência da Informação', 'main_category_id' => 3],
            ['name' => 'Museologia', 'main_category_id' => 3],
            ['name' => 'Comunicação', 'main_category_id' => 3],
            ['name' => 'Serviço Social', 'main_category_id' => 3],
            ['name' => 'Economia Doméstica', 'main_category_id' => 3],
            ['name' => 'Desenho Industrial', 'main_category_id' => 3],
            ['name' => 'Turismo', 'main_category_id' => 3],
            ['name' => 'Filosofia', 'main_category_id' => 3],
            ['name' => 'Sociologia', 'main_category_id' => 3],
            ['name' => 'Antropologia', 'main_category_id' => 3],
            ['name' => 'Arqueologia', 'main_category_id' => 3],
            ['name' => 'História', 'main_category_id' => 3],
            ['name' => 'Geografia', 'main_category_id' => 3],
            ['name' => 'Psicologia', 'main_category_id' => 3],
            ['name' => 'Educação', 'main_category_id' => 3],
            ['name' => 'Ciência Política', 'main_category_id' => 3],
            ['name' => 'Teologia', 'main_category_id' => 3],
            ['name' => 'Lingüística', 'main_category_id' => 3],
            ['name' => 'Letras', 'main_category_id' => 3],
            ['name' => 'Artes', 'main_category_id' => 3],

            // CAE Subcategorias
            ['name' => 'Agronomia', 'main_category_id' => 4],
            ['name' => 'Recursos Florestais e Engenharia Florestal', 'main_category_id' => 4],
            ['name' => 'Engenharia Agrícola', 'main_category_id' => 4],
            ['name' => 'Zootecnia', 'main_category_id' => 4],
            ['name' => 'Medicina Veterinária', 'main_category_id' => 4],
            ['name' => 'Recursos Pesqueiros e Engenharia de Pesca', 'main_category_id' => 4],
            ['name' => 'Ciência e Tecnologia de Alimentos', 'main_category_id' => 4],
            ['name' => 'Engenharia Civil', 'main_category_id' => 4],
            ['name' => 'Engenharia de Minas', 'main_category_id' => 4],
            ['name' => 'Engenharia de Materiais e Metalúrgica', 'main_category_id' => 4],
            ['name' => 'Engenharia Elétrica', 'main_category_id' => 4],
            ['name' => 'Engenharia Mecânica', 'main_category_id' => 4],
            ['name' => 'Engenharia Química', 'main_category_id' => 4],
            ['name' => 'Engenharia Sanitária', 'main_category_id' => 4],
            ['name' => 'Engenharia de Produção', 'main_category_id' => 4],
            ['name' => 'Engenharia Nuclear', 'main_category_id' => 4],
            ['name' => 'Engenharia de Transportes', 'main_category_id' => 4],
            ['name' => 'Engenharia Naval e Oceânica', 'main_category_id' => 4],
            ['name' => 'Engenharia Aeroespacial', 'main_category_id' => 4],
            ['name' => 'Engenharia Biomédica', 'main_category_id' => 4],
        ];

        // Inserir categorias principais
        Category::insert($mainCategories);

        // Inserir subcategorias
        Category::insert($subCategories);
    }
}
