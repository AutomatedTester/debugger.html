"use strict";

const t = require("tcomb");

const Source = t.struct({
  id: t.String,
  url: t.String
});

const Location = t.struct({
  sourceId: t.String,
  line: t.Number,
  column: t.Number
});

const Frame = t.struct({
  id: t.String,
  displayName: t.String,
  location: Location
});

module.exports = {
  Source,
  Location,
  Frame
};
