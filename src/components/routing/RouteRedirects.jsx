/**
 * @file RouteRedirects.jsx
 * @description Shared router redirect components used by App.jsx and FoundryApp.jsx.
 * URL logic lives in ./redirectTargets.js (unit-tested in tests/engine/routeRedirectsAndDeepLinks.test.mjs).
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { buildSearchPreservingTarget, buildFoundryRedirectTarget } from './redirectTargets';

/** Redirects to `to`, carrying over the current query string. */
export const SearchPreservingRedirect = ({ to }) => {
  const location = useLocation();
  return <Navigate to={buildSearchPreservingTarget(to, location.search)} replace />;
};

/** Redirects a legacy Foundry alias to the canonical `/foundry?view=…&tab=…` URL in a single hop. */
export const FoundryRouteRedirect = ({ view, tab }) => {
  const location = useLocation();
  return <Navigate to={buildFoundryRedirectTarget({ view, tab }, location.search)} replace />;
};
