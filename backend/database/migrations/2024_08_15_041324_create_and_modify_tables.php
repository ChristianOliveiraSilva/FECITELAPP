<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabela students
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamps();
        });

        // Tabela categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // Tabela projects
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('qr_code');
            $table->text('description')->nullable();
            $table->integer('year')->nullable();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->timestamps();
        });

        // Tabela evaluators
        Schema::create('evaluators', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->integer('PIN')->nullable();
            $table->timestamps();
        });

        // Tabela questions
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->text('text');
            $table->integer('type'); // 1 para texto, 2 para escolha
            $table->timestamps();
        });

        // Tabela responses
        Schema::create('responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluator_id')->constrained('evaluators')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->text('response');
            $table->integer('score');
            $table->timestamps();
        });

        // Tabela awards
        Schema::create('awards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // Tabela award_question
        Schema::create('award_question', function (Blueprint $table) {
            $table->foreignId('award_id')->constrained('awards')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->integer('weight');
            $table->primary(['award_id', 'question_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::dropIfExists('award_question');
        Schema::dropIfExists('awards');
        Schema::dropIfExists('responses');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('evaluators');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('students');
    }
};
