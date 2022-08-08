CREATE MIGRATION m1mil27ebigwdwbw5hkwld63hffpbcqoo3muoh42tuii6nrczutlcq
    ONTO m1nedbc7catgpzpttjminmbl7s6hv2kjk23dcrcyk7zgat7ojtm62q
{
  ALTER TYPE default::RefreshToken {
      ALTER LINK user {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
