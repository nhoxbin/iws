# Optimized Database Migrations

This directory contains cleaned and optimized migrations for the Q&A system.

## Migration Summary

### System Tables (Laravel defaults)

1. **0001_01_01_000000_create_users_table.php**

    - `users` - User accounts with role field
    - `password_reset_tokens` - Password reset functionality
    - `sessions` - Session management

2. **0001_01_01_000001_create_cache_table.php**

    - `cache` - Application cache
    - `cache_locks` - Cache locking mechanism

3. **0001_01_01_000002_create_jobs_table.php**
    - `jobs` - Queue jobs
    - `job_batches` - Batch job tracking
    - `failed_jobs` - Failed job logging

### Application Tables

4. **2024_01_01_000001_create_categories_and_tags_tables.php**

    - `categories` - Question categories with slug and description
    - `tags` - Question tags with slug

5. **2024_01_01_000002_create_posts_table.php**

    - `posts` - Questions with all fields (title, slug, question, views, votes, etc.)
    - `post_tag` - Pivot for post-tag relationships
    - `saved_posts` - Pivot for user-saved posts
    - `post_votes` - User votes on posts (upvote/downvote)

6. **2024_01_01_000003_create_answers_table.php**

    - `answers` - Answers to questions
    - `answer_helpful` - Pivot for helpful votes (mutually exclusive with unhelpful)
    - `answer_unhelpful` - Pivot for unhelpful votes (mutually exclusive with helpful)

7. **2024_01_01_000004_create_comments_table.php**

    - `comments` - Comments on answers with nested reply support

8. **2024_01_01_000005_create_notifications_table.php**
    - `notifications` - User notifications for various events

## Key Improvements

### 1. Consolidated Migrations

-   Combined multiple ALTER TABLE migrations into single CREATE TABLE statements
-   All post-related tables in one migration
-   All answer-related tables in one migration

### 2. Added Indexes

-   Performance indexes on frequently queried columns
-   Composite indexes for common query patterns
-   Foreign key indexes for relationship lookups

### 3. Added Unique Constraints

-   Category and tag names/slugs are unique
-   Post slugs are unique
-   Pivot table combinations are unique

### 4. Better Organization

-   Logical grouping of related tables
-   Clear migration order with proper dependencies
-   Comprehensive comments

### 5. Enhanced Fields

-   Added `slug` to categories and tags
-   Added `description` to categories
-   All fields defined upfront (no separate ALTER migrations)

## Migration Instructions

### Fresh Installation

```bash
# Backup your database first!
# Then drop all tables and run fresh migrations
php artisan migrate:fresh --path=database/migrations_new

# Or if you want to seed data as well
php artisan migrate:fresh --seed --path=database/migrations_new
```

### Production Migration

```bash
# 1. Backup your database
# 2. Export existing data if needed
# 3. Drop old migrations table or clear it
# 4. Run new migrations
php artisan migrate --path=database/migrations_new
```

## Database Schema Overview

```
users (1) ─────< posts (n)
               ├─< answers (n)
               │   ├─< comments (n)
               │   ├─< answer_helpful (pivot)
               │   └─< answer_unhelpful (pivot)
               ├─< post_votes (pivot)
               └─< saved_posts (pivot)

categories (1) ─< posts (n)
tags (n) ──────< post_tag >──── posts (n)
users (1) ─────< notifications (n)
```

## Notes

-   Answer votes (helpful/unhelpful) are mutually exclusive
-   Post votes (upvote/downvote) are mutually exclusive
-   Comments support nested replies via self-referencing `parent_id`
-   Indexes added for optimal query performance
-   All foreign keys use proper cascade deletes
