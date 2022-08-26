# Protours API

> Backend API for Booking Tours application

# Documenetation

API documentation [here](https://documenter.getpostman.com/view/20664212/VUquMG9i)

# API Specifications

### Tours
- List all tours in the database
   * Pagination
   * Select specific fields in result
   * Limit number of results
   * Filter by fields
- Get single Tour
- Create new Tour
  * Authenticated users only
  * Must have the role "guide" or "admin"
  * Field validation via Mongoose
- Upload a photos for tour
  * Admin only
  * Photo will be uploaded to local filesystem
- Update tours
  * Admin only
  * Validation on update
- Delete tour
  * Admin only
- Get Cheapest 5 tours
- Get Monthly Plan

### Bookings
- List all bookings for tour
- List all bookings
- Get single tour
- Create new booking
  * Authenticated users only
  * Based on tour and user
- Update Booking
- Delete Booking
  
### Reviews
- List all reviews for user
- List all reviews in general
  * Pagination, filtering, sorting, etc
- Get a single review
- Create a review
  * Authenticated users only
  * Must have the role "users"
- Update review
  * User only
- Delete review
  * User only

### Users & Authentication
- Authentication will be using JWT/cookies
  * JWT and cookie should expire in 60 days
- User registration
  * Register as a "user" or "guide" or "admin"
  * Once registered, a token will be sent along with a cookie (token = xxx)
  * Passwords must be hashed
- User login
  * User can login with email and password
  * Plain text password will compare with stored hashed password
  * Once logged in, a token will be sent along with a cookie (token = xxx)
- User logout
  * Cookie will be sent to set token = none
- Get user
  * Route to get the currently logged in user (via token)
- Password reset (lost password)
  * User can request to reset password
  * A hashed token will be emailed to the users registered email address
  * A put request can be made to the generated url to reset password
  * The token will expire after 10 minutes
- Update user info
  * Authenticated user only
  * Separate route to update password
  
## Security
- Encrypt passwords and reset tokens
- Prevent NoSQL injections
- Add headers for security (helmet)
- Prevent cross site scripting - XSS
- Add a rate limit for requests of 100 requests per 10 minutes
- Protect against http param polution

## Documentation
- Use Postman to create documentation

## Deployment
- Push to Github

## Code Related Suggestions
- NPM scripts for dev and production env
- Config file for important constants
- Use controller methods with documented descriptions/routes
- Error handling middleware
- Authentication middleware for protecting routes and setting user roles
- Validation using Mongoose and validator library
- Use async/await (create middleware to clean up controller methods)
- Create a database seeder to import and destroy data
