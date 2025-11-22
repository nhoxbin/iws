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
        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'views_count')) {
                $table->integer('views_count')->default(0)->after('question');
            }
            if (!Schema::hasColumn('posts', 'is_resolved')) {
                $table->boolean('is_resolved')->default(false)->after('question');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['views_count', 'is_resolved']);
        });
    }
};
