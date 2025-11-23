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
        Schema::create('post_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('vote_type', ['upvote', 'downvote']);
            $table->timestamps();

            $table->unique(['post_id', 'user_id']);
        });

        // Add vote counts to posts table
        Schema::table('posts', function (Blueprint $table) {
            $table->integer('upvotes_count')->default(0)->after('views_count');
            $table->integer('downvotes_count')->default(0)->after('upvotes_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['upvotes_count', 'downvotes_count']);
        });

        Schema::dropIfExists('post_votes');
    }
};
