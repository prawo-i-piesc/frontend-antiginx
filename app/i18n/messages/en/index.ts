import admin from "./admin";
import adminOverview from "./adminOverview";
import auth from "./auth";
import charts from "./charts";
import common from "./common";
import dashboard from "./dashboard";
import errors from "./errors";
import landing from "./landing";
import legal from "./legal";
import meta from "./meta";
import notFound from "./notFound";
import password from "./password";
import pricing from "./pricing";
import profile from "./profile";
import scan from "./scan";
import scanner from "./scanner";
import shell from "./shell";
import table from "./table";
import widgets from "./widgets";

/**
 * English is the reference dictionary: its shape is the `Messages` type, so a
 * key missing from the Polish one — or one with the wrong arguments — fails
 * the type check instead of rendering `undefined`.
 */
const en = {
  common,
  meta,
  shell,
  scan,
  landing,
  pricing,
  legal,
  notFound,
  auth,
  errors,
  password,
  dashboard,
  widgets,
  adminOverview,
  scanner,
  charts,
  admin,
  table,
  profile,
};

export type Messages = typeof en;

export default en;
