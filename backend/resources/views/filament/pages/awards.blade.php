
<x-filament-panels::page>
    <p>Ordene e filtre pelas Perguntas</p>

    <form action="{{ \App\Filament\Pages\AwardsPage::getUrl() }}" method="GET">
        <div class="flex space-x-4">
            {{-- Grau de Escolaridade --}}
            <select name="school_grade" class="border-gray-300 rounded-lg" style="width: 100%;">
                <option value="">Selecione o Grau de Escolaridade</option>
                @foreach($schoolGrades as $grade)
                    <option value="{{ $grade->id }}" {{ request('school_grade') == $grade->id ? 'selected' : '' }}>
                        {{ $grade->name }}
                    </option>
                @endforeach
            </select>

            {{-- Área --}}
            <select name="category" class="border-gray-300 rounded-lg" style="width: 100%;">
                <option value="">Selecione a Área</option>
                @foreach($categories as $category)
                    <option value="{{ $category->id }}" {{ request('category') == $category->id ? 'selected' : '' }}>
                        {{ $category->name }}
                    </option>
                @endforeach
            </select>

            {{-- Questão --}}
            <select name="question" class="border-gray-300 rounded-lg" style="width: 100%;">
                <option value="">Todas as questões</option>
                @foreach($questions as $q)
                    <option value="{{ $q->id }}" {{ request('q') == $q->id ? 'selected' : '' }}>
                        {{ $q->scientific_text }} / {{ $q->technological_text }}
                    </option>
                @endforeach
            </select>
        </div>

        <button type="submit" class="my-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out" style="background-color: darkblue;">
            Filtrar
        </button>
    </form>


    <div class="overflow-x-auto">
        <table id="table" class=" w-full table-auto border-collapse border border-gray-200 shadow-lg">
            <thead class="bg-gray-100">
                <tr>
                    <th class="sortable px-4 py-2 text-left border border-gray-200 cursor-pointer select-none" data-type="string">ID do Projeto</th>
                    <th class="sortable px-4 py-2 text-left border border-gray-200 cursor-pointer select-none" data-type="string">Projeto</th>
                    <th class="sortable px-4 py-2 text-left border border-gray-200 cursor-pointer select-none" data-type="number">
                        @if (request('question'))
                            {{ $question->scientific_text }} / {{ $question->technological_text }}
                        @else
                            Nota Final
                        @endif
                    </th>
                </tr>
            </thead>
            <tbody>
                @foreach ($projects as $project)
                    <tr class="bg-white even:bg-gray-50">
                        <td class="px-4 py-2 border border-gray-200">
                            <a href="{{ '/admin/projects/'. $project->id .'/assessment' }}">
                                {{ $project->external_id }}
                            </a>
                        </td>
                        <td class="px-4 py-2 border border-gray-200">
                            <a href="{{ '/admin/projects/'. $project->id .'/assessment' }}">
                                {{ $project->title }}
                            </a>
                        </td>
                        <td class="px-4 py-2 border border-gray-200">
                            @if (request('question'))
                                {{ $project->getNoteByQuestion($question) }}
                            @else
                                {{ $project->final_note }}
                            @endif    
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</x-filament-panels::page>

<script>
    document.querySelectorAll(".sortable").forEach(header => {
        header.addEventListener("click", () => {
            const table = document.getElementById("table");
            const tbody = table.querySelector("tbody");
            const rows = Array.from(tbody.querySelectorAll("tr"));
            const index = Array.from(header.parentNode.children).indexOf(header);
            const type = header.getAttribute("data-type");
            const isAscending = header.classList.contains("ascending");
            
            rows.sort((rowA, rowB) => {
                const cellA = rowA.children[index].innerText;
                const cellB = rowB.children[index].innerText;
                
                if (type === "number") {
                    return isAscending ? cellA - cellB : cellB - cellA;
                } else {
                    return isAscending 
                        ? cellA.localeCompare(cellB) 
                        : cellB.localeCompare(cellA);
                }
            });
            
            tbody.innerHTML = "";
            
            rows.forEach(row => tbody.appendChild(row));
            
            header.classList.toggle("ascending", !isAscending);
        });
    });
</script>