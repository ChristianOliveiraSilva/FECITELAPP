<div x-data="{ openIndex: null }" style="--col-span-default: 1 / -1;" class="col-[--col-span-default] fi-wi-widget fi-wi-stats-overview mx-auto p-6 bg-white rounded-lg shadow-lg">
    <div class="accordion" id="accordionExample">
        @foreach($values as $index => $category)
            <div class="border-b border-gray-300">
                <h2 class="flex items-center justify-between">
                    <button 
                        class="w-full text-left py-4 px-6 text-gray-900 font-bold transition-all duration-300 hover:bg-gray-100 focus:outline-none" 
                        @click="openIndex = openIndex === {{ $index }} ? null : {{ $index }}">
                        {{ $category['name'] }}
                    </button>
                </h2>
                <div x-show="openIndex === {{ $index }}" x-transition class="p-4">
                    <div class="bg-gray-50 shadow-md rounded-lg p-4">
                        <p class="text-gray-700"><strong>Total de Projetos:</strong> {{ $category['totalProjects'] }}</p>
                        <p class="text-gray-700"><strong>Projetos com Avaliações Pendentes:</strong> {{ $category['projectsWithPendingAssessments'] }}</p>
                        <p class="text-gray-700"><strong>Projetos com Todas as Avaliações Respondidas:</strong> {{ $category['projectsWithAllAssessmentsResponded'] }}</p>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
</div>
