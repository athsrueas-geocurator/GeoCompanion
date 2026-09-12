CREATE TABLE IF NOT EXISTS events (
  day TEXT NOT NULL,
  route TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day,route,action)
);
