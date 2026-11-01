import type { Messages } from "@/app/i18n/messages/en";

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
import system from "./system";
import table from "./table";
import widgets from "./widgets";

const pl: Messages = {
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
  system,
  table,
  profile,
};

export default pl;
