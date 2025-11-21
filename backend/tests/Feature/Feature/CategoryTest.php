<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_categories()
    {
        Category::factory()->count(3)->create();

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_guest_can_view_a_single_category()
    {
        $category = Category::factory()->create();

        $response = $this->getJson('/api/categories/' . $category->id);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $category->id,
                    'name' => $category->name,
                ]
            ]);
    }

    public function test_junior_user_cannot_create_category()
    {
        $user = User::factory()->create(['role' => 'junior']);

        $response = $this->actingAs($user, 'api')->postJson('/api/categories', [
            'name' => 'New Category',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_user_can_create_category()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'api')->postJson('/api/categories', [
            'name' => 'New Category',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'name' => 'New Category',
                ]
            ]);

        $this->assertDatabaseHas('categories', [
            'name' => 'New Category',
        ]);
    }

    public function test_junior_user_cannot_update_category()
    {
        $user = User::factory()->create(['role' => 'junior']);
        $category = Category::factory()->create();

        $response = $this->actingAs($user, 'api')->putJson('/api/categories/' . $category->id, [
            'name' => 'Updated Category',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_user_can_update_category()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();

        $response = $this->actingAs($admin, 'api')->putJson('/api/categories/' . $category->id, [
            'name' => 'Updated Category',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Updated Category',
                ]
            ]);

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Updated Category',
        ]);
    }

    public function test_junior_user_cannot_delete_category()
    {
        $user = User::factory()->create(['role' => 'junior']);
        $category = Category::factory()->create();

        $response = $this->actingAs($user, 'api')->deleteJson('/api/categories/' . $category->id);

        $response->assertStatus(403);
    }

    public function test_admin_user_can_delete_category()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();

        $response = $this->actingAs($admin, 'api')->deleteJson('/api/categories/' . $category->id);

        $response->assertStatus(204);

        $this->assertDatabaseMissing('categories', [
            'id' => $category->id,
        ]);
    }
}
