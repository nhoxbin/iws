# Q&A Feature Documentation

This document describes the Q&A feature implementation for the IWS (Interview with Senior) platform.

## Overview

The Q&A feature allows users to:

- Browse all questions from the community
- View detailed question pages with answers
- Submit answers to questions
- Mark answers as helpful
- Filter questions by category
- Save questions for later reference

## Frontend Pages

### 1. Questions List Page (`/questions`)

- Displays all questions with pagination
- Shows question stats (answers count, views count)
- Category filtering
- Tags display
- Author information
- Responsive design

### 2. Question Detail Page (`/questions/[id]`)

- Full question content with title and description
- Category and tags
- Author information
- Answer section with all submitted answers
- Answer submission form (for authenticated users)
- Mark answers as helpful functionality
- Save/bookmark questions
- Edit/delete options (for question owners)

## Backend API Endpoints

### Posts (Questions)

- `GET /api/posts` - List all posts/questions (paginated)
- `GET /api/posts/{id}` - Get single post with answers
- `POST /api/posts` - Create new question (auth required)
- `PUT /api/posts/{id}` - Update question (auth required, owner only)
- `DELETE /api/posts/{id}` - Delete question (auth required, owner only)
- `POST /api/posts/{id}/save` - Save/unsave question (auth required)
- `GET /api/saved-posts` - Get user's saved posts (auth required)

### Answers

- `POST /api/posts/{post}/answers` - Submit answer to a question (auth required)
- `PUT /api/answers/{answer}` - Update answer (auth required, owner only)
- `DELETE /api/answers/{answer}` - Delete answer (auth required, owner only)
- `POST /api/answers/{answer}/helpful` - Toggle helpful status (auth required)

### Categories

- `GET /api/categories` - List all categories

## Database Schema

### Posts Table

```
- id (primary key)
- title (string)
- question (text)
- user_id (foreign key)
- category_id (foreign key, nullable)
- views_count (integer, default: 0)
- is_resolved (boolean, default: false)
- created_at
- updated_at
```

### Answers Table

```
- id (primary key)
- post_id (foreign key)
- user_id (foreign key)
- answer (text)
- helpful_count (integer, default: 0)
- created_at
- updated_at
```

### Answer Helpful Table (Pivot)

```
- id (primary key)
- answer_id (foreign key)
- user_id (foreign key)
- created_at
- updated_at
- unique constraint on (answer_id, user_id)
```

## Models

### Post Model

- Relationships: user, tags, category, answers, savedByUsers

### Answer Model

- Relationships: post, user, helpfulByUsers
- Methods: isMarkedHelpfulBy($userId)

### User Model

- Relationships: posts, savedPosts, answers

## Features

### Question Management

- Create, read, update, delete questions
- Tag questions with multiple tags
- Categorize questions
- Track view count
- Mark questions as resolved

### Answer Management

- Submit answers to questions
- Edit and delete own answers
- Track helpful count per answer
- Users can mark answers as helpful

### User Interactions

- Save/bookmark questions
- View saved questions
- Filter questions by category
- Browse all questions with pagination

## Setup Instructions

### Backend Setup

1. Run migrations:

```bash
cd backend
php artisan migrate
```

2. (Optional) Seed sample data:

```bash
php artisan db:seed
```

### Frontend Setup

The frontend is already configured and ready to use. The pages are located at:

- `/questions` - Browse all questions
- `/questions/[id]` - View individual question with answers
- `/my-questions` - View your own questions
- `/ask-question` - Create new question

## Usage

1. **Browse Questions**: Navigate to `/questions` to see all community questions
2. **View Question Details**: Click on any question to see full details and answers
3. **Submit Answer**: Login and use the answer form at the bottom of question detail page
4. **Mark Helpful**: Click the "Helpful" button on answers you find useful
5. **Save Questions**: Click the bookmark icon to save questions for later
6. **Filter by Category**: Use category buttons on questions page to filter

## API Response Examples

### Get Single Question

```json
{
  "data": {
    "id": 1,
    "title": "How do you approach designing a scalable notification system?",
    "question": "I'm looking for insights on best practices...",
    "created_at": "2024-05-20T10:00:00Z",
    "updated_at": "2024-05-20T10:00:00Z",
    "is_resolved": false,
    "answers_count": 2,
    "views_count": 128,
    "user": {
      "id": 1,
      "name": "Alex Chen",
      "email": "alex@example.com",
      "role": "Software Engineer"
    },
    "tags": [
      { "id": 1, "name": "System Design" },
      { "id": 2, "name": "Career Growth" }
    ],
    "category": {
      "id": 1,
      "name": "Development"
    },
    "answers": [
      {
        "id": 1,
        "answer": "Great question! A robust notification system...",
        "helpful_count": 28,
        "is_helpful": false,
        "created_at": "2024-05-20T11:00:00Z",
        "updated_at": "2024-05-20T11:00:00Z",
        "user": {
          "id": 2,
          "name": "Jane Doe",
          "email": "jane@example.com",
          "role": "Senior"
        }
      }
    ]
  }
}
```

## Notes

- All authenticated endpoints require JWT token in Authorization header
- Question owners can edit and delete their own questions
- Answer owners can edit and delete their own answers
- Users can only mark each answer as helpful once
- Pagination is set to 10 items per page by default
