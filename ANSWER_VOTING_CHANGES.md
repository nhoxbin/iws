# Answer Voting System Changes

## Summary

Implemented a comprehensive voting system for answers with the following key features:

- Replaced helpful/unhelpful system with upvote/downvote
- Added ability for post owners to mark answers as helpful
- Automatically sets `is_resolved` to `true` on posts when any answer is marked helpful

## Database Changes

### Migration: `2024_01_01_000003_create_answers_table.php`

- **Removed**: `helpful_count`, `unhelpful_count` columns
- **Removed**: `answer_helpful`, `answer_unhelpful` pivot tables
- **Added**: `upvotes_count`, `downvotes_count`, `is_helpful` columns to `answers` table
- **Added**: `answer_votes` table with columns:
  - `id`, `answer_id`, `user_id`, `vote_type` (enum: 'upvote', 'downvote'), `timestamps`
  - Unique constraint on `[answer_id, user_id]`

## Model Changes

### New Model: `AnswerVote`

- Location: `backend/app/Models/AnswerVote.php`
- Handles the relationship between users and their votes on answers

### Updated Model: `Answer`

- **Removed methods**:

  - `helpfulByUsers()`
  - `unhelpfulByUsers()`
  - `isMarkedHelpfulBy($userId)`
  - `isMarkedUnhelpfulBy($userId)`

- **Added methods**:

  - `votes()` - hasMany relationship with AnswerVote
  - `upvotedByUsers()` - users who upvoted
  - `downvotedByUsers()` - users who downvoted
  - `getUserVote($userId)` - get user's vote on answer

- **Updated fillable**: Now includes `upvotes_count`, `downvotes_count`, `is_helpful`
- **Updated casts**: Changed to use new vote count fields

## Controller Changes

### `AnswerController`

- **Removed methods**:

  - `toggleHelpful()`
  - `toggleUnhelpful()`

- **Added methods**:
  - `vote(Request $request, Answer $answer)` - Handle upvote/downvote with toggle functionality
  - `markHelpful(Answer $answer)` - Allow post owner to mark answer as helpful (sets `is_resolved` on post)

## Resource Changes

### `AnswerResource`

- **Removed fields**: `helpful_count`, `unhelpful_count`, `is_helpful` (user-specific), `is_unhelpful`
- **Added fields**:
  - `upvotes_count` - total upvotes
  - `downvotes_count` - total downvotes
  - `is_helpful` - whether post owner marked this as helpful
  - `user_vote` - current user's vote ('upvote', 'downvote', or null)

## API Routes Changes

### Removed Routes

- `POST /api/answers/{answer}/helpful`
- `POST /api/answers/{answer}/unhelpful`

### Added Routes

- `POST /api/answers/{answer}/vote` - Vote on answer (requires `vote_type` param: 'upvote' or 'downvote')
- `POST /api/answers/{answer}/mark-helpful` - Mark answer as helpful (post owner only)

## Key Features

### 1. Voting System

- Users can upvote or downvote answers
- Clicking the same vote type removes the vote
- Clicking opposite vote type switches the vote
- Vote counts are automatically maintained

### 2. Mark as Helpful

- Only post owners can mark answers as helpful
- Multiple answers can be marked helpful
- When an answer is marked helpful, the post's `is_resolved` is set to `true`
- When all helpful answers are unmarked, `is_resolved` is set to `false`

### 3. Edit/Delete Protection

- Answers cannot be edited or deleted once they have received any votes
- This prevents manipulation after community engagement

## Frontend Changes Required

The frontend needs to be updated to:

1. Replace helpful/unhelpful buttons with upvote/downvote buttons
2. Display vote counts (upvotes - downvotes or separately)
3. Show visual indicator when user has voted
4. Add "Mark as Helpful" button for post owners
5. Show visual indicator for answers marked as helpful
6. Update API calls from `/helpful` and `/unhelpful` to `/vote` and `/mark-helpful`
7. Update data structure to use `upvotes_count`, `downvotes_count`, `user_vote`, `is_helpful`

## Migration Instructions

1. Backup database
2. Run migrations: `php artisan migrate:fresh` (or create a new migration to alter existing tables)
3. Update frontend code to match new API structure
4. Test thoroughly in development environment
