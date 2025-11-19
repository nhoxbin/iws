# Laravel JWT Authentication API Documentation

This document describes the JWT authentication implementation in the Laravel backend.

## Installation & Setup

### 1. Install Dependencies

```bash
cd backend
composer require tymon/jwt-auth
```

### 2. Publish JWT Configuration

```bash
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret
```

### 3. Database Setup

Update your `.env` file with database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=iws
DB_USERNAME=root
DB_PASSWORD=your_password
```

**Create the database:**

```bash
mysql -u root -p
CREATE DATABASE iws;
exit;
```

### 4. Run Migrations

```bash
php artisan migrate
```

## API Endpoints

Base URL: `http://iws.local/api/auth`

### 1. Register

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "password_confirmation": "Password123"
}
```

**Validation Rules:**

-   `name`: required, string, min:2, max:255
-   `email`: required, valid email, max:255, unique
-   `password`: required, min:8, confirmed, must contain uppercase, lowercase, and number
-   `password_confirmation`: required, must match password

**Success Response (201):**

```json
{
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": null,
        "created_at": "2025-11-20T00:00:00.000000Z",
        "updated_at": "2025-11-20T00:00:00.000000Z"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Error Response (422):**

```json
{
    "message": "Validation failed",
    "errors": {
        "email": ["The email has already been taken."],
        "password": ["Password must contain at least one uppercase letter..."]
    }
}
```

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
    "email": "john@example.com",
    "password": "Password123"
}
```

**Validation Rules:**

-   `email`: required, valid email
-   `password`: required, min:6

**Success Response (200):**

```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 3600
}
```

**Error Response (401):**

```json
{
    "message": "Invalid credentials"
}
```

### 3. Get User Info

**Endpoint:** `GET /api/auth/me`

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200):**

```json
{
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "junior",
    "email_verified_at": null,
    "created_at": "2025-11-20T00:00:00.000000Z",
    "updated_at": "2025-11-20T00:00:00.000000Z"
}
```

**Error Response (401):**

```json
{
    "message": "Unauthenticated."
}
```

### 4. Update User Role

**Endpoint:** `POST /api/auth/user/role`

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
    "role": "junior"
}
```

**Validation Rules:**

-   `role`: required, string, must be one of: fresher, junior, middle, senior

**Success Response (200):**

```json
{
    "message": "Role updated successfully",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "junior",
        "created_at": "2025-11-20T00:00:00.000000Z",
        "updated_at": "2025-11-20T00:00:00.000000Z"
    }
}
```

### 5. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200):**

```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 3600
}
```

### 6. Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200):**

```json
{
    "message": "Successfully logged out"
}
```

## JWT Token Structure

The JWT token contains the following claims:

```json
{
    "iss": "http://iws.local",
    "iat": 1700000000,
    "exp": 1700003600,
    "nbf": 1700000000,
    "jti": "unique-token-id",
    "sub": "1",
    "prv": "hash",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "junior"
}
```

-   `sub`: User ID
-   `email`: User email
-   `name`: User name
-   `role`: User role (fresher, junior, middle, senior)
-   `exp`: Token expiration time (default: 1 hour)

## Configuration

### JWT Config (`config/jwt.php`)

Key configurations:

```php
'ttl' => env('JWT_TTL', 60), // Token lifetime in minutes
'refresh_ttl' => env('JWT_REFRESH_TTL', 20160), // Refresh token lifetime (2 weeks)
```

### Auth Config (`config/auth.php`)

```php
'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
        'hash' => false,
    ],
],
```

## User Model

The User model implements `JWTSubject`:

```php
class User extends Authenticatable implements JWTSubject
{
    protected $fillable = ['name', 'email', 'password', 'role'];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'email' => $this->email,
            'name' => $this->name,
            'role' => $this->role,
        ];
    }
}
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(255) NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

## Testing with cURL

### Register

```bash
curl -X POST http://iws.local/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "password_confirmation": "Password123"
  }'
```

### Login

```bash
curl -X POST http://iws.local/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Get User Info

```bash
curl -X GET http://iws.local/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Role

```bash
curl -X POST http://iws.local/api/auth/user/role \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"role": "junior"}'
```

## CORS Configuration

If your frontend is on a different domain, add CORS middleware:

1. Install CORS package (included in Laravel by default)

2. Update `config/cors.php`:

```php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://iws.local'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## Error Handling

### Common Errors

**401 Unauthorized:**

-   Token is missing
-   Token is expired
-   Token is invalid
-   User doesn't exist

**422 Validation Error:**

-   Required fields missing
-   Invalid data format
-   Validation rules not met

**500 Internal Server Error:**

-   Database connection issues
-   Server configuration problems

## Security Best Practices

1. **Use HTTPS in production**
2. **Keep JWT_SECRET secure** - Never commit to version control
3. **Short token lifetime** - Default 1 hour
4. **Implement refresh tokens** - For better UX
5. **Validate all inputs** - Use Laravel validation
6. **Hash passwords** - Always use bcrypt/argon2
7. **Rate limiting** - Prevent brute force attacks

## Files Structure

```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           └── AuthController.php
│   └── Models/
│       └── User.php
├── config/
│   ├── auth.php
│   └── jwt.php
├── database/
│   └── migrations/
│       └── 2025_11_19_175916_add_role_to_users_table.php
└── routes/
    └── api.php
```

## Troubleshooting

### Token Not Working

1. Check if JWT_SECRET is set in `.env`
2. Clear config cache: `php artisan config:clear`
3. Verify Authorization header format: `Bearer {token}`

### Database Connection Failed

1. Check `.env` database credentials
2. Ensure database exists
3. Run migrations: `php artisan migrate`

### CORS Issues

1. Check `config/cors.php`
2. Verify frontend URL is in `allowed_origins`
3. Ensure `supports_credentials` is `true`

## Integration with Frontend

The frontend should:

1. Store JWT token in localStorage
2. Include token in Authorization header: `Bearer {token}`
3. Handle token expiration (401 response)
4. Use refresh endpoint to get new token
5. Clear token on logout

See `frontend/JWT_IMPLEMENTATION.md` for frontend implementation details.
