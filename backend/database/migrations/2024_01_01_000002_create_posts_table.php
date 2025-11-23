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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('question');
            $table->integer('views_count')->default(0);
            $table->integer('upvotes_count')->default(0);
            $table->integer('downvotes_count')->default(0);
            $table->boolean('is_resolved')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['category_id', 'created_at']);
            $table->index('is_resolved');
        });

        // Pivot table for post tags
        Schema::create('post_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['post_id', 'tag_id']);
        });

        // Pivot table for saved posts
        Schema::create('saved_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'post_id']);
            $table->index('user_id');
        });

        // Post votes table
        Schema::create('post_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('vote_type', ['upvote', 'downvote']);
            $table->timestamps();

            $table->unique(['post_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_votes');
        Schema::dropIfExists('saved_posts');
        Schema::dropIfExists('post_tag');
        Schema::dropIfExists('posts');
    }
};
