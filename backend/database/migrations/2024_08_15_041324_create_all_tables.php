<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_grades', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
            $table->softDeletes();
        });
        
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('school')->nullable();
            $table->foreignId('school_grade_id')->constrained('school_grades')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('main_category_id')->nullable()->constrained('categories')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('year');
            $table->integer('area');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->integer('external_id');
            $table->timestamps();
            $table->softDeletes();
        });
        
        Schema::create('student_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('evaluators', function (Blueprint $table) {
            $table->id();
            $table->integer('PIN');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluator_id')->constrained('evaluators')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->text('text');
            $table->integer('type');
            $table->integer('area');
            $table->integer('number_alternatives');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->foreignId('assessment_id')->constrained('assessments')->onDelete('cascade');
            $table->text('response')->nullable();
            $table->integer('score')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('awards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('school_grade_id')->constrained('school_grades')->onDelete('cascade');
            $table->integer('total_positions');
            $table->boolean('use_school_grades');
            $table->boolean('use_categories');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('award_question', function (Blueprint $table) {
            $table->id();
            $table->foreignId('award_id')->constrained('awards')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('evaluator_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('evaluator_id')->constrained('evaluators')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
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
