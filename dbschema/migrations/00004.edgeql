CREATE MIGRATION m162pwggirjzksgswylpfww7liswcsdnooh5ndhfa7rldpwzymmo3a
    ONTO m1mil27ebigwdwbw5hkwld63hffpbcqoo3muoh42tuii6nrczutlcq
{
  ALTER TYPE default::RefreshToken {
      ALTER PROPERTY token {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
