ERRORS = {

    # ─── JWT / Token Errors ────────────────────────────────────────────────────

    # Missing Authorization header / token
    "JWT_TOKEN_001": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_001",
        "message": "Authorization token is required.",
    },

    # Expired access token
    "JWT_TOKEN_002": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_002",
        "message": "Token has expired. Please login again.",
    },

    # Malformed / invalid token
    "JWT_TOKEN_003": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_003",
        "message": "Invalid token. Please login again.",
    },

    # Invalid signature
    "JWT_TOKEN_004": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_004",
        "message": "Token signature is invalid.",
    },

    # Wrong token type (e.g. refresh sent where access expected)
    "JWT_TOKEN_005": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_005",
        "message": "Invalid token type.",
    },

    # Refresh token has expired
    "JWT_TOKEN_006": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_006",
        "message": "Refresh token has expired. Please login again.",
    },

    # Invalid refresh token
    "JWT_TOKEN_007": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_007",
        "message": "Invalid refresh token.",
    },

    # Decorator used on function without Request parameter
    "JWT_TOKEN_008": {
        "status_code": 500,
        "error_code": "JWT_TOKEN_008",
        "message": "Function must receive a 'request: Request' parameter to use the @jwt_required decorator.",
    },

    # Caller lacks the required role/permission
    "JWT_TOKEN_009": {
        "status_code": 403,
        "error_code": "JWT_TOKEN_009",
        "message": "Access denied. You do not have the required permissions for this action.",
    },

    # ─── Database Errors ───────────────────────────────────────────────────────

    "DB_ERROR_001": {
        "status_code": 500,
        "error_code": "DB_ERROR_001",
        "message": "A database error occurred. Please try again later.",
    },

    # ─── Authentication Errors ─────────────────────────────────────────────────

    # Invalid username or password (login failure — intentionally vague for security)
    "AUTH_ERROR_001": {
        "status_code": 401,
        "error_code": "AUTH_ERROR_001",
        "message": "Invalid username or password.",
    },

    # Account is deactivated
    "AUTH_ERROR_002": {
        "status_code": 403,
        "error_code": "AUTH_ERROR_002",
        "message": "Your account is inactive. Please contact an administrator.",
    },

    # Account requires a mandatory password reset (first login or admin reset)
    "AUTH_ERROR_003": {
        "status_code": 403,
        "error_code": "AUTH_ERROR_003",
        "message": "Password reset is required. Please reset your password before logging in.",
    },

    # Resource (user) not found by ID
    "AUTH_ERROR_004": {
        "status_code": 404,
        "error_code": "AUTH_ERROR_004",
        "message": "User not found.",
    },

    # Duplicate username on create/update
    "AUTH_ERROR_005": {
        "status_code": 409,
        "error_code": "AUTH_ERROR_005",
        "message": "Username is already taken. Please choose a different username.",
    },

    # Duplicate email on create/update
    "AUTH_ERROR_006": {
        "status_code": 409,
        "error_code": "AUTH_ERROR_006",
        "message": "An account with this email address already exists.",
    },

    # Invalid or expired OTP during password reset
    "AUTH_ERROR_007": {
        "status_code": 400,
        "error_code": "AUTH_ERROR_007",
        "message": "The OTP or temporary password is invalid or has expired.",
    },

    # Attempt to delete or perform a restricted action on an admin user
    "AUTH_ERROR_008": {
        "status_code": 403,
        "error_code": "AUTH_ERROR_008",
        "message": "This action cannot be performed on an admin user.",
    },

    # ─── Author Errors ──────────────────────────────────────────────────────────

    # Author resource not found by ID
    "AUTHOR_ERROR_001": {
        "status_code": 404,
        "error_code": "AUTHOR_ERROR_001",
        "message": "Author not found.",
    },

    # Required author fields are empty or invalid
    "AUTHOR_ERROR_002": {
        "status_code": 400,
        "error_code": "AUTHOR_ERROR_002",
        "message": "Invalid author details provided. First name and last name are required.",
    },

    # ─── Book Errors ────────────────────────────────────────────────────────────

    # Book resource not found by ID
    "BOOK_ERROR_001": {
        "status_code": 404,
        "error_code": "BOOK_ERROR_001",
        "message": "Book not found.",
    },

    # Duplicate ISBN on create / update
    "BOOK_ERROR_002": {
        "status_code": 409,
        "error_code": "BOOK_ERROR_002",
        "message": "A book with this ISBN already exists.",
    },

    # Required book fields are empty or invalid
    "BOOK_ERROR_003": {
        "status_code": 400,
        "error_code": "BOOK_ERROR_003",
        "message": "Invalid book details. Title and ISBN are required.",
    },

    # available_copies > total_copies
    "BOOK_ERROR_004": {
        "status_code": 400,
        "error_code": "BOOK_ERROR_004",
        "message": "Available copies cannot exceed total copies.",
    },

    # ─── Category Errors ────────────────────────────────────────────────────────

    # Category resource not found by ID or name
    "CATEGORY_ERROR_001": {
        "status_code": 404,
        "error_code": "CATEGORY_ERROR_001",
        "message": "Category not found.",
    },

    # Duplicate category name
    "CATEGORY_ERROR_002": {
        "status_code": 409,
        "error_code": "CATEGORY_ERROR_002",
        "message": "A category with this name already exists.",
    },

    # Required category fields are empty
    "CATEGORY_ERROR_003": {
        "status_code": 400,
        "error_code": "CATEGORY_ERROR_003",
        "message": "Category name is required.",
    },
}