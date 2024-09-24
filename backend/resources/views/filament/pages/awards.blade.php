
<x-filament-panels::page>
    <div class="overflow-x-auto">
        <table class="min-w-full table-auto border-collapse border border-gray-200 shadow-lg">
            <thead class="bg-gray-100">
                <tr>
                    <th class="px-4 py-2 text-left border border-gray-200">Nome do Prêmio</th>
                    <th class="px-4 py-2 text-left border border-gray-200">Série Escolar</th>
                    <th class="px-4 py-2 text-left border border-gray-200">Vencedor(es)</th>
                    <th class="px-4 py-2 text-left border border-gray-200">Pontuação</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($awards as $award)
                    @php
                        $total = $award->total_positions;
                        $school_grades = ['Ensino Fundamental', 'Ensino Médio'];
                        $categories = \App\Models\Category::mainCategories();
                    @endphp

                    @for ($i = 0; $i < $award->total_positions; $i++)
                        @if ($award->use_school_grades)
                            @foreach ($school_grades as $school_grade)
                                @if ($award->use_categories)
                                    @foreach ($categories as $category)
                                        <tr class="bg-white even:bg-gray-50">
                                            <td class="px-4 py-2 border border-gray-200">{{ $i + 1 }}º {{ $award->name }} {{ $school_grade }} {{ $category->name }}</td>
                                            <td class="px-4 py-2 border border-gray-200">{{ $award->schoolGrade->name }}</td>
                                            <td class="px-4 py-2 border border-gray-200">{{ $award->getWinner($i, $school_grade, $category->id) }}</td>
                                            <td class="px-4 py-2 border border-gray-200">{{ $award->getWinnerScore($i) }}</td>
                                        </tr>
                                    @endforeach
                                @else
                                    <tr class="bg-white even:bg-gray-50">
                                        <td class="px-4 py-2 border border-gray-200">{{ $i + 1 }}º {{ $award->name }} {{ $school_grade }}</td>
                                        <td class="px-4 py-2 border border-gray-200">{{ $award->schoolGrade->name }}</td>
                                        <td class="px-4 py-2 border border-gray-200">{{ $award->getWinner($i, $school_grade) }}</td>
                                        <td class="px-4 py-2 border border-gray-200">{{ $award->getWinnerScore($i) }}</td>
                                    </tr>
                                @endif
                            @endforeach
                        @elseif ($award->use_categories)
                            @foreach ($categories as $category)
                                <tr class="bg-white even:bg-gray-50">
                                    <td class="px-4 py-2 border border-gray-200">{{ $i + 1 }}º {{ $award->name }} {{ $category->name }}</td>
                                    <td class="px-4 py-2 border border-gray-200">{{ $award->schoolGrade->name }}</td>
                                    <td class="px-4 py-2 border border-gray-200">{{ $award->getWinner($i, null, $category->id) }}</td>
                                    <td class="px-4 py-2 border border-gray-200">{{ $award->getWinnerScore($i) }}</td>
                                </tr>
                            @endforeach
                        @else
                            <tr class="bg-white even:bg-gray-50">
                                <td class="px-4 py-2 border border-gray-200">{{ $i + 1 }}º {{ $award->name }}</td>
                                <td class="px-4 py-2 border border-gray-200">{{ $award->schoolGrade->name }}</td>
                                <td class="px-4 py-2 border border-gray-200">{{ $award->getWinner($i) }}</td>
                                <td class="px-4 py-2 border border-gray-200">{{ $award->getWinnerScore($i) }}</td>
                            </tr>
                        @endif
                    @endfor
                @endforeach
            </tbody>
        </table>
    </div>
</x-filament-panels::page>
