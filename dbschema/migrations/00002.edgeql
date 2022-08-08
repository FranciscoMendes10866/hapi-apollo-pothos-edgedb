CREATE MIGRATION m1nedbc7catgpzpttjminmbl7s6hv2kjk23dcrcyk7zgat7ojtm62q
    ONTO m1hehcyakxpsob3u2kvhjthc7zjugam34lfne226tyuvlz7rgldeyq
{
  ALTER TYPE default::RefreshToken {
      ALTER LINK user {
          SET MULTI;
      };
  };
};
