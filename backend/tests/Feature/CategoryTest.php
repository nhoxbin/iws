<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_category(): void
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $categoryData = ['name' => 'Test Category'];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/categories', $categoryData);

        $response->assertStatus(201)
            ->assertJsonFragment($categoryData);

        $this->assertDatabaseHas('categories', $categoryData);
    }

    public function test_can_list_categories(): void
    {
        Category::factory()->count(3)->create();

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }
}