<br />

<p align="center">
    <img src=".github/static/logo.svg" alt="Metrom logo" width="60%" />
</p>

<br />

<p align="center">
    Metrom is a flexible liquidity mining platform designed to help AMMs and projects efficiently launch and manage multiple incentivisation campaigns.
</p>

<br />

<p align="center">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="License: GPL v3">
    <img src="https://github.com/metrom-xyz/monorepo/actions/workflows/ci.yml/badge.svg" alt="CI">
</p>

# Metrom monorepo

A monorepo for all things Metrom. The packages are managed through `pnpm`
workspaces and `turborepo`.

## Packages

The monorepo contains the following packages under the `packages` folder:

- `@monorepo/frontend`: The official Metrom frontend built with Next.js.
- `@monorepo/sdk`: A general-purpose SDK for interacting with Metrom. It
  provides interfaces for Metrom entities, clients to fetch protocol data from
  services like `backend` and `data-manager`, and utility functions.
- `@monorepo/ui`: A React-based implementation of the Metrom design system,
  developed in TypeScript and documented with Storybook. Widely used in the
  frontend for UI components.
- `@monorepo/subgraph`: The official Metrom subgraph implementation.
- `@monorepo/blocks-subgraphs`: Block subgraphs for each Metrom-supported
  network.

Additionally, there are subgraph packages for different AMM variants supported
by Metrom.
