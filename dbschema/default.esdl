module default {
    type User {
        required property username -> str {
            constraint exclusive;
        };
        required property password -> str;
    }

    type RefreshToken {
        required property token -> str {
            constraint exclusive;
        };
        required property expiresAt -> int64;
        required multi link user -> User {
            constraint exclusive;
        };
    }
}