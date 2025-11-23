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
        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('answer');
            $table->integer('upvotes_count')->default(0);
            $table->integer('downvotes_count')->default(0);
            $table->boolean('is_helpful')->default(false);
            $table->timestamps();

            $table->index(['post_id', 'created_at']);
            $table->index('user_id');
        });

        // Answer votes table
        Schema::create('answer_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('answer_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('vote_type', ['upvote', 'downvote']);
            $table->timestamps();

            $table->unique(['answer_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('answer_votes');
        Schema::dropIfExists('answers');
    }
};
