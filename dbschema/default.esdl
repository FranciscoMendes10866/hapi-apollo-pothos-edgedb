module default {
    type User {
        required property username -> str {
            constraint exclusive;
        };
        required property password -> str;
    }

    type RefreshToken {
        required property token -> str;
        required property expiresAt -> int64;
        required link user -> User;
    }
}