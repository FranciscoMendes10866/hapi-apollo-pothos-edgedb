CREATE MIGRATION m1hehcyakxpsob3u2kvhjthc7zjugam34lfne226tyuvlz7rgldeyq
    ONTO initial
{
  CREATE TYPE default::User {
      CREATE REQUIRED PROPERTY password -> std::str;
      CREATE REQUIRED PROPERTY username -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE TYPE default::RefreshToken {
      CREATE REQUIRED LINK user -> default::User;
      CREATE REQUIRED PROPERTY expiresAt -> std::int64;
      CREATE REQUIRED PROPERTY token -> std::str;
  };
};
