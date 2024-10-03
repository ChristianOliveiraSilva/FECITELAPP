<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

@php
    $jsonFilePath = storage_path('../database/seeders/data/dados.json');
    $existingData = json_decode(File::get($jsonFilePath), true);

    $total = count($existingData['data']);
@endphp

<h1 class="text-center">Total de dados: {{ $total }}/98</h1>

<form class="p-3 my-2" action="/add" method="POST">
    @if (session('success'))
        <div class="alert alert-success">
            {{ session('success') }}
        </div>
    @endif

    @if (session('error'))
        <div class="alert alert-danger">
            {{ session('error') }}
        </div>
    @endif


    <div class="row">
        <div class="col-6">
            <!-- Projeto -->
            <h3>Cadastro de Projeto</h3>
            <div class="row m-5">
                
                <div class="col text-center">
                    <label for="grau_escolar">Grau Escolar:</label>
                    <select name="grau_escolar" id="grau_escolar">
                        <option value="2">Ensino médio</option>
                        <option value="1">Ensino Fundamental</option>
                        <option value="3">Ensino Superior</option>
                    </select>
                </div>

                <div class="col text-center">
                    <label for="external_id">ID Externo:</label>
                    <input type="number" name="external_id" id="external_id" value="{{ $total + 1 }}" required>
                </div>

                <div class="col text-center">
                    <label for="category_id">Categoria:</label>
                    <select name="category_id" id="category_id">
                        <option value="5">MDIS - Multidisciplinar</option>
                        <option value="4">CAE - Ciências Agrárias e Engenharias</option>
                        <option value="3">CHSAL - Ciências Humanas; Sociais Aplicadas e Linguística e Artes</option>
                        <option value="2">CET - Ciências Exatas e da Terra</option>
                        <option value="1">CBS - Ciências Biológicas e da Saúde</option>
                    </select>
                </div>

                <div class="col text-center">
                    <label for="area">Área:</label>
                    <select name="area" id="area">
                        <option value="1">Tecnológico</option>
                        <option value="2">Científico</option>
                    </select>
                </div>

                <div class="col text-center">
                    <label for="title">Título:</label>
                    <input type="text" name="title" id="title" required>
                </div>

                <div class="col text-center">
                    <label>Escola geral:</label>
                    <input type="text" class="escola" name="escola" id="escola" value="IFMS -TL">
                </div>
            </div>

            <!-- Estudantes -->
            <h3>Cadastro de Estudantes</h3>
            @for ($i = 1; $i <= 5; $i++)
                <div class="row my-4">
                    <div class="col text-center">
                        <label for="student{{ $i }}_name">Nome do Estudante {{ $i }}:</label>
                        <input type="text" name="student{{ $i }}_name" id="student{{ $i }}_name">
                    </div>
                    <div class="col text-center">
                        <label for="student{{ $i }}_email">Email do Estudante {{ $i }}:</label>
                        <input type="email" name="student{{ $i }}_email" id="student{{ $i }}_email">
                    </div>
                </div>
            @endfor

            <div class="text-center mt-5">
                <button type="submit">Cadastrar</button>
            </div>
        </div>

        <div class="col-6">
            <!-- Avaliador -->
            <h3 class="mt-5">Cadastro de Avaliador</h3>
            <div class="row">
                <div class="col text-center">
                    <p>ID do Avaliador 1:</p>
                    @foreach ($evaluators as $evaluator)
                        <input type="radio" id="evaluator1-{{ $evaluator->id }}" name="evaluator1_id" value="{{ $evaluator->id }}">
                        <label for="evaluator1-{{ $evaluator->id }}">{{ $evaluator->user->name }}</label><br>
                    @endforeach
                </div>
                <div class="col text-center">
                    <p>ID do Avaliador 2:</p>
                    @foreach ($evaluators as $evaluator)
                        <input type="radio" id="evaluator2-{{ $evaluator->id }}" name="evaluator2_id" value="{{ $evaluator->id }}">
                        <label for="evaluator2-{{ $evaluator->id }}">{{ $evaluator->user->name }}</label><br>
                    @endforeach
                </div>
                <div class="col text-center">
                    <p>ID do Avaliador 3:</p>
                    @foreach ($evaluators as $evaluator)
                        <input type="radio" id="evaluator3-{{ $evaluator->id }}" name="evaluator3_id" value="{{ $evaluator->id }}">
                        <label for="evaluator3-{{ $evaluator->id }}">{{ $evaluator->user->name }}</label><br>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    <!-- Botão para enviar -->
    <div class="text-center">
        <button type="submit">Cadastrar</button>
    </div>
</form>


<script>
    function insertEscolas(value) {
        document.querySelectorAll('.escola').forEach(function(escola) {
            escola.value = value;
        });
    }
</script>