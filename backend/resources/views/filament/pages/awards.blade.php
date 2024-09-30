
<x-filament-panels::page>
    <p>Ordene e filtre pelas Perguntas</p>

    <div class="overflow-x-auto">
        <table id="table" class="min-w-full table-auto border-collapse border border-gray-200 shadow-lg">
            <thead class="bg-gray-100">
                <tr>
                    <th class="sortable px-4 py-2 text-left border border-gray-200 cursor-pointer select-none" data-type="string">Projeto</th>
                    <th class="sortable px-4 py-2 text-left border border-gray-200 cursor-pointer select-none" data-type="number">Nota Final</th>
                    @foreach ($questions as $question)
                        <th class="sortable px-4 py-2 text-left border border-gray-200 cursor-pointer select-none" data-type="number">{{ $question->text }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach ($projects as $project)
                    <tr class="bg-white even:bg-gray-50">
                        <td class="px-4 py-2 border border-gray-200">{{ $project->title }}</td>
                        <td class="px-4 py-2 border border-gray-200">{{ $project->final_note }}</td>
                        @foreach ($questions as $question)
                            <td class="px-4 py-2 border border-gray-200">{{ $project->getNoteByQuestion($question) }}</td>
                        @endforeach
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